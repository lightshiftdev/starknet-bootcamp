from starkware.cairo.common.registers import get_fp_and_pc

struct Vector2:
    member x : felt
    member y : felt
end

func add3(v1 : Vector2, v2 : Vector2) -> (r : Vector2):
    alloc_locals

    local res : Vector2
    assert res.x = v1.x + v2.x
    assert res.y = v1.y + v2.y

    return (res)
end

func addn(vs_len : felt, vs : Vector2*) -> (r : Vector2):
    alloc_locals

    local res : Vector2

    # end of recursive call. return (0, 0)
    if vs_len == 0:
        assert res.x = 0
        assert res.y = 0

        return (res)
    end

    # recursive call. add current element with tail result
    let (prev) = addn(vs_len - 1, vs + Vector2.SIZE)
    assert res.x = vs.x + prev.x
    assert res.y = vs.y + prev.y

    return (res)
end

func main() -> ():
    alloc_locals

    #
    # adding two vectors
    #
    let v1 = Vector2(1, 2)
    let v2 = Vector2(3, 4)

    let (res2) = add2(v1, v2)

    assert res2.x = 4
    assert res2.y = 6

    #
    # adding a list of vectors
    #
    local vector_tuple : (Vector2, Vector2, Vector2) = (
        Vector2(1, 2),
        Vector2(3, 4),
        Vector2(5, 6)
        )

    # Get the value of the frame poitner register (fp) so that
    # we can use the address of vector_tuple
    let (__fp__, _) = get_fp_and_pc()
    let (resn) = add_multiple(3, cast(&vector_tuple, Vector2*))

    assert resn.x = 9
    assert resn.y = 12

    return ()
end
