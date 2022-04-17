%builtins output

from starkware.cairo.common.serialize import serialize_word

func main{output_ptr: felt*}():
    serialize_word(100)

    return ()
end