%lang starknet

# some useful imports you'll likely need
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_not_zero, assert_not_equal, assert_in_range
from starkware.cairo.common.hash import hash2
from starkware.starknet.common.syscalls import get_caller_address

#
# Purposefully left empty
#