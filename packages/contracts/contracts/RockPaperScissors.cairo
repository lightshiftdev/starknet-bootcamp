%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_not_zero, assert_not_equal, assert_in_range
from starkware.cairo.common.hash import hash2

from starkware.starknet.common.syscalls import get_caller_address

struct Game:
    member player1 : felt
    member player2 : felt
    member hashed_move1 : felt
    member hashed_move2 : felt
    member move1 : felt
    member move2 : felt
    member winner : felt
end

# We store one mapping per value because we're actually only updating a couple
# values at a time
# In some use cases, it would be a better fit to use a single storage of structs:
#   @storage_var
#   func games(game_id: felt) -> (Game):
#   end
#
@storage_var
func player1_storage(game_id : felt) -> (player1 : felt):
end
@storage_var
func player2_storage(game_id : felt) -> (player2 : felt):
end
@storage_var
func hashed_move1_storage(game_id : felt) -> (hashed_move1 : felt):
end
@storage_var
func hashed_move2_storage(game_id : felt) -> (hashed_move2 : felt):
end
@storage_var
func move1_storage(game_id : felt) -> (move1 : felt):
end
@storage_var
func move2_storage(game_id : felt) -> (move2 : felt):
end
@storage_var
func winner_storage(game_id : felt) -> (winner : felt):
end

# Returns the full state for a game. Here we built a full Game struct, by
# grabbing values from all the various mappings
@view
func game{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(game_id : felt) -> (
        game : Game):
    let (player1) = player1_storage.read(game_id)
    let (player2) = player2_storage.read(game_id)
    let (hashed_move1) = hashed_move1_storage.read(game_id)
    let (hashed_move2) = hashed_move2_storage.read(game_id)
    let (move1) = move1_storage.read(game_id)
    let (move2) = move2_storage.read(game_id)
    let (winner) = winner_storage.read(game_id)

    let game = Game(player1, player2, hashed_move1, hashed_move2, move1, move2, winner)

    return (game)
end

# A game can only receive a move if two moves haven't been played yet
# i.e. if the 2nd player is still unassinged
# Also, if player1 already set, then player 2 needs to be different
@external
func play{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        game_id : felt, hashed_move : felt):
    let (player1) = player1_storage.read(game_id)
    let (player2) = player2_storage.read(game_id)
    let (hashed_move1) = hashed_move1_storage.read(game_id)

    let (sender) = get_caller_address()

    # ensure at least one player left
    assert player2 = 0

    # ensure both players are different
    # if player1 = 0, this still works
    assert_not_equal(player1, sender)

    # move cannot be zero
    assert_not_zero(hashed_move)

    # two moves can't be the same
    # only need to check against the first move
    assert_not_equal(hashed_move1, hashed_move)

    if player1 == 0:
        # player 1 is 0, so we set that one
        player1_storage.write(game_id, sender)
        hashed_move1_storage.write(game_id, hashed_move)
    else:
        # otherwise, we set player 2
        player2_storage.write(game_id, sender)
        hashed_move2_storage.write(game_id, hashed_move)
    end

    return ()
end

# Reveal a move, by sending in the raw move along with the salt Hashing the two
# must match the existing hashed move by one of the players
@external
func reveal{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        game_id : felt, move : felt, salt : felt):
    alloc_locals

    let (player1) = player1_storage.read(game_id)
    let (player2) = player2_storage.read(game_id)
    let (hashed_move1) = hashed_move1_storage.read(game_id)
    let (hashed_move2) = hashed_move2_storage.read(game_id)

    assert_not_zero(player2)
    assert_in_range(move, 1, 4)

    let (computed_hashed_move1) = hash_move(move, salt, player1)
    let (computed_hashed_move2) = hash_move(move, salt, player2)

    if computed_hashed_move1 == hashed_move1:
        # reveal player1
        move1_storage.write(game_id, move)

        # return immediately on every branch
        # otherwise we'd need to deal with revoked references everywhere
        return ()
    else:
        if computed_hashed_move2 == hashed_move2:
            # reveal player2
            move2_storage.write(game_id, move)

            return ()
        else:
            return ()
        end
    end
end

@external
func finish{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(game_id : felt):
    let (player1) = player1_storage.read(game_id)
    let (player2) = player2_storage.read(game_id)
    let (move1) = move1_storage.read(game_id)
    let (move2) = move1_storage.read(game_id)

    let (winner) = compute_winner(move1, move2)

    return ()
end

# computes hash(hash(move, salt), caller_address)
func hash_move{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        move : felt, salt : felt, player : felt) -> (hash : felt):
    alloc_locals

    let (res) = hash2{hash_ptr=pedersen_ptr}(move, salt)
    let (res) = hash2{hash_ptr=pedersen_ptr}(res, player)

    return (res)
end

# # 1 -> Rock
# # 2 -> Paper
# # 3 -> Scissors
# # [1,2] -> 3 (paper beats rock)
# # [1,3] -> 2 (rock beats scissor)
# # [2,1] -> 2 (paper beats rock)
# # [2,3] -> 3 (scissors beats paper)
# # [3,1] -> 3 (rock beats scissor)
# # [3,2] -> 2 (scissors beats paper)
##
# # More generically:
# # [x,x+1] -> 2
# # [x,x-1] -> 1
# # [x,x+2] -> 1
# # [x,x-2] -> 2
##
# # @dev This function is declared as a view function purely so it can be
# # unit-tested directly
@view
func compute_winner{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        move1 : felt, move2 : felt) -> (winner : felt):
    assert_not_zero(move1)
    assert_not_zero(move2)

    if move1 == move2:
        # it's a tie, no one wins
        return (3)
    end

    if move1 + 1 == move2:
        return (2)
    end

    if move1 - 1 == move2:
        return (1)
    end

    if move1 + 2 == move2:
        return (1)
    end

    if move1 - 2 == move2:
        return (2)
    end

    # This should never happen
    return (0)
end
