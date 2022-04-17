#
# with explicitly typed arguments
#
func add(x : felt, y : felt) -> (z : felt):
    return (z=x + y)
end

#
# felts are used by default
# and named returns are actually optional
#
func prod(x, y) -> (z):
    return (x * y)
end

func main():
    # same applies when calling functions:
    # named or unnamed arguments both work
    let (res_add) = add(x=6, y=5)
    let (res_prod) = prod(6, 5)

    # Verify computations
    assert res_add = 11
    assert res_prod = 30

    return ()
end
