#
# Cairo's field elements are... unintuitive at first
# https://www.cairo-lang.org/docs/hello_cairo/intro.html#the-primitive-type-field-element-felt
#

%builtins range_check

from starkware.cairo.common.serialize import serialize_word
from starkware.cairo.common.math import assert_not_zero, assert_not_equal, assert_nn, assert_le

func main{range_check_ptr : felt}():
    assert_not_zero(1)  # non-zero
    assert_not_equal(1, 2)  # different
    assert_nn(1)  # non-negative
    assert_le(1, 10)  # less or equal

    # remember the weird felt behaviour from 03-cairo-felt.cairo?
    # this one would actually fail with `out of range`
    # assert_le(7/7, 7)

    return ()
end
