// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IStarknetMessaging} from "./interfaces/IStarknetMessaging.sol";

contract BridgedNFT is ERC721, Ownable {
    /// $ python3
    /// >>> from starkware.starknet.compiler.compile import get_selector_from_name
    /// >>> print(get_selector_from_name('bridge_to_l2'))
    uint256 public constant STARKNET_SELECTOR_BRIDGE_TO_L2 =
        1270110522599020763073720183865236337926928257520500615438825284083604217227;

    IStarknetMessaging starknet;
    uint256 l2Contract;

    uint256 public bridgeToL2Selector;

    constructor(
        string memory _name,
        string memory _symbol,
        IStarknetMessaging _starknet
    ) ERC721(_name, _symbol) Ownable() {
        starknet = _starknet;
    }

    function initialize(uint256 _l2Contract) public onlyOwner {
        require(l2Contract == 0, "already set");
        l2Contract = _l2Contract;
    }

    modifier onlyInitialized() {
        require(l2Contract != 0, "not initialized");
        _;
    }

    function bridgeFromL2(address to, uint256 tokenId) external {
        // reconstructo the payload
        uint256[] memory payload = new uint256[](2);
        payload[0] = uint256(uint160(to));
        payload[1] = tokenId;

        // consumes the message
        // implicitly means the matching message must exist
        starknet.consumeMessageFromL2(l2Contract, payload);

        _mint(to, tokenId);
    }

    function bridgeToL2(uint256 l2_user, uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");

        uint256[] memory payload = new uint256[](2);
        payload[0] = l2_user;
        payload[1] = tokenId;

        starknet.sendMessageToL2(
            l2Contract,
            STARKNET_SELECTOR_BRIDGE_TO_L2,
            payload
        );

        _burn(tokenId);
    }
}
