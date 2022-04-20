func main():
    alloc_locals

    local x
    local y

    %{
        print("this is a hint")
        ids.x = 3
        idx.y = 2
    %}

    assert x + y = 5

    return ()
end

#
# just for fun: check math.cairo on the cairo-lang repo
# https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/math.cairo
#
