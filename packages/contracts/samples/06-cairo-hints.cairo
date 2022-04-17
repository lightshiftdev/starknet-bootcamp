func main():
    alloc_locals

    local x

    %{
        ids.x = 5
        print("foo")
    %}

    assert x * x = 25

    return ()
end
