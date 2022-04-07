// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import {IStarknetMessaging} from "./IStarknetMessaging.sol";

interface IMockStarknetMessaging is IStarknetMessaging {
    /**
     * Sends a message to an L2 contract.
     * Returns the hash of the message.
     *
     * @param to_address Destination address on L2
     * @param selector L1 handler selector, as given by `get_selector_from_name('func_name')
     * @param payload message payload
     * @return Hash of the message sent
     */
    function sendMessageToL2(
        uint256 to_address,
        uint256 selector,
        uint256[] calldata payload
    ) external returns (bytes32);

    /**
     * Consumes a message that was sent from an L2 contract.
     * Returns the hash of the message.
     *
     * @param fromAddress origin address on L2
     * @param payload message payload
     * @return Hash of the message consumed
     */
    function consumeMessageFromL2(
        uint256 fromAddress,
        uint256[] calldata payload
    ) external returns (bytes32);

    /**
     * How many L2->L1 messages with the given hash are currently pending
     *
     * @param msgHash The hash to query for
     * @return Amount of messages sent matching this hash
     */
    function l2ToL1Messages(bytes32 msgHash) external view returns (uint256);

    /**
     * How many L1->L2 messages with the given hash are currently pending
     *
     * @param msgHash The hash to query for
     * @return Amount of messages sent matching this hash
     */
    function l1ToL2Messages(bytes32 msgHash) external view returns (uint256);
}
