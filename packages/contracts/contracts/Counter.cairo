# This indicates we're creating a starknet contract, rather than a pure Cairo program
%lang starknet

# Builtins are low-level execution units that perform some predefined computations useful to Cairo programs
#   pedersen is the builtin for Perdern hash computations
#   range_check is useful for numerical comparison operations
# Read more at: https://www.cairo-lang.org/docs/how_cairo_works/builtins.html
%builtins pedersen range_check

# The pedersen builtin is actually of type HashBuiltin, so we need to import that for function declarations
from starkware.cairo.common.cairo_builtins import HashBuiltin

# the math module contains useful math helpers for numerical comparisons, such as assert_le (assert lower-or-equal)
from starkware.cairo.common.math import assert_le

# storage variables are created by declaring empty functions with the @storage_var decorator
# functions with no arguments store a single-value
# functions with arguments work as key-value maps
@storage_var
func counter() -> (value : felt):
end

@storage_var
func max_inc() -> (value : felt):
end

@event
func incremented(inc : felt):
end

# the constructor decorator is what you'd expect
# but function declarations may look weird at first, due to the two sets of arguments
# between {} we see the (not-so) implicit arguments
#   syscall_ptr allows access to system call, such as read() and write() of storage values
#   pedersen_ptr and range_check_ptr correspond to the two imported builtints. Storage values also require these behind the scenes
@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        initial : felt, max : felt):
    max_inc.write(max)
    counter.write(initial)
    incremented.emit(initial)
    return ()
end

# view functions are just what you'd expect. They can read state, but not modify it
# (not actually enforced by the compiler at the moment, so you may run into some weird behaviour)
@view
func read{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (value : felt):
    let (value) = counter.read()
    return (value)
end

# this one actually mutates state
@external
func increment{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(inc : felt):
    let (max) = max_inc.read()
    assert_le(inc, max)
    let (current) = counter.read()
    counter.write(current + inc)

    incremented.emit(inc)
    return ()
end

func _increment(value : felt, inc : felt) -> (new_value : felt):
    tempvar foo = (value + inc)

    return (foo)
end
