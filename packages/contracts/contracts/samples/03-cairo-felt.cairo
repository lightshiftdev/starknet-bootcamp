#
# Cairo's field elements are... unintuitive at first
# https://www.cairo-lang.org/docs/hello_cairo/intro.html#the-primitive-type-field-element-felt
#

%builtins output range_check

from starkware.cairo.common.serialize import serialize_word
from starkware.cairo.common.math import assert_le

func main{output_ptr : felt*, range_check_ptr : felt}():
    tempvar x = 7 / 3
    serialize_word(x)

    tempvar y = x * 3
    serialize_word(y)

    assert y = 7

    return ()
end
