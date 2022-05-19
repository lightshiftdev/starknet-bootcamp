%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_not_zero, assert_not_equal, assert_in_range
from starkware.cairo.common.hash import hash2
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.math import split_felt

from starkware.cairo.common.uint256 import Uint256
from starkware.starknet.common.syscalls import get_contract_address, get_caller_address
from starkware.starknet.common.messages import send_message_to_l1

from openzeppelin.token.erc721.library import (
    ERC721_name, ERC721_symbol, ERC721_balanceOf, ERC721_ownerOf, ERC721_getApproved,
    ERC721_isApprovedForAll, ERC721_mint, ERC721_burn, ERC721_initializer, ERC721_approve,
    ERC721_setApprovalForAll, ERC721_transferFrom, ERC721_safeTransferFrom, _transfer)

#
# Custom logic
# 

@storage_var
func l1_contract_storage() -> (address: felt):
end

@storage_var
func minter_storage() -> (game: felt):
end

@storage_var
func next_token_id_storage() -> (next_token_id: felt):
end

@constructor
func constructor{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr
    }(
        name: felt,
        symbol: felt,
        minter: felt,
        l1_contract: felt
    ):
    ERC721_initializer(name, symbol)

    minter_storage.write(minter)
    l1_contract_storage.write(l1_contract)

    return ()
end

@external
func mint{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr
    }(
        user: felt,
    ):
    let (caller) = get_caller_address()
    let (minter) = minter_storage.read()
    let (next_token_id) = next_token_id_storage.read()
    next_token_id_storage.write(next_token_id + 1)

    assert caller = minter

    let (uint256_token_id) = felt_to_uint256(next_token_id)

    ERC721_mint(user, uint256_token_id)
    return()
end


@external
func bridge_to_l1{
        syscall_ptr: felt*,
        pedersen_ptr:HashBuiltin*,
        range_check_ptr
    }(
        l1_user: felt,
        token_id: felt
    ):

    let (uint256_token_id) = felt_to_uint256(token_id)
    let (owner) = ERC721_ownerOf(uint256_token_id)
    let (self) = get_contract_address()
    let (to_address) = l1_contract_storage.read()

    ERC721_transferFrom(owner, self, uint256_token_id)

    let (payload: felt*) = alloc()
    assert payload[0] = l1_user
    assert payload[1] = token_id
    let (to_address) = l1_contract_storage.read()

    send_message_to_l1(to_address, 2, payload)

    return()
end

@l1_handler
func bridge_to_l2{
        syscall_ptr: felt*,
        pedersen_ptr:HashBuiltin*,
        range_check_ptr
    }(
        from_address: felt,
        l2_user: felt,
        token_id: felt
    ):
    let (l1_contract) = l1_contract_storage.read()

    assert from_address = l1_contract

    let (uint256_token_id) = felt_to_uint256(token_id)
    let (self) = get_contract_address()

    # We can't call ERC721_transferFrom here, because that checks if get_caller_address() != 0,
    # which is not true within an @l1_handler
    # So we call _transfer directly
    _transfer(self, l2_user, uint256_token_id)

    return ()
end

func felt_to_uint256{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr
    }(
        x: felt
    ) -> (x_ : Uint256):
    let (high, low) = split_felt(x)

    return (Uint256(low=low, high=high))
end
 
#
# Standard ERC721 ABI - No need to look into this
#

@view
func name{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (name : felt):
    let (name) = ERC721_name()
    return (name)
end

@view
func symbol{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (symbol : felt):
    let (symbol) = ERC721_symbol()
    return (symbol)
end

@view
func balanceOf{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(owner : felt) -> (
        balance : Uint256):
    let (balance : Uint256) = ERC721_balanceOf(owner)
    return (balance)
end

@view
func ownerOf{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        token_id : Uint256) -> (owner : felt):
    let (owner : felt) = ERC721_ownerOf(token_id)
    return (owner)
end

@view
func getApproved{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        token_id : Uint256) -> (approved : felt):
    let (approved : felt) = ERC721_getApproved(token_id)
    return (approved)
end

@view
func isApprovedForAll{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        owner : felt, operator : felt) -> (is_approved : felt):
    let (is_approved : felt) = ERC721_isApprovedForAll(owner, operator)
    return (is_approved)
end

#
# Externals
#

@external
func approve{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        to : felt, token_id : Uint256):
    ERC721_approve(to, token_id)
    return ()
end

@external
func setApprovalForAll{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        operator : felt, approved : felt):
    ERC721_setApprovalForAll(operator, approved)
    return ()
end

@external
func transferFrom{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        _from : felt, to : felt, token_id : Uint256):
    ERC721_transferFrom(_from, to, token_id)
    return ()
end

@external
func safeTransferFrom{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        _from : felt, to : felt, token_id : Uint256, data_len : felt, data : felt*):
    ERC721_safeTransferFrom(_from, to, token_id, data_len, data)
    return ()
end