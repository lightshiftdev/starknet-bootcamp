import { starknet, ethers } from "hardhat";
import { shortString, number as starknetNumber } from "starknet";
import { expect } from "chai";
import { Account, StarknetContract } from "hardhat/types";
import { BridgedNFT } from "../../src/types";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const strToFelt = (str: string): BigInt => {
  return BigInt(starknetNumber.toFelt(shortString.encodeShortString(str)));
};

interface CairoUint256 {
  low: BigInt;
  high: BigInt;
}

describe("L1<>L2 Bridge", function () {
  this.timeout(100_000);

  let l1User: SignerWithAddress;
  let user: Account;
  let minter: Account;
  let nft: StarknetContract;
  let l1nft: BridgedNFT;
  let userAddr: BigInt;
  let minterAddr: BigInt;
  let nftAddr: BigInt;

  //
  // deploy the L1 Contract
  //
  before(async () => {
    [l1User] = await ethers.getSigners();

    console.log("loading L1 messaging contract");
    const starknetL1Contract = await starknet.devnet.loadL1MessagingContract(
      "http://ganache:8545"
    );

    const BridgedNFTArtifact = await ethers.getContractFactory("BridgedNFT");
    l1nft = (await BridgedNFTArtifact.deploy(
      "NFT-L1",
      "NFT-L1",
      starknetL1Contract.address
    )) as BridgedNFT;
    await l1nft.deployed();
  });

  //
  // deploy the L2 contracts
  //
  before(async () => {
    console.log("deploying L2 contracts");
    user = await starknet.deployAccount("OpenZeppelin");
    minter = await starknet.deployAccount("OpenZeppelin");
    const nftFactory = await starknet.getContractFactory("NFT");
    nft = await nftFactory.deploy({
      name: strToFelt("NFT-L2"),
      symbol: strToFelt("NFT-L2"),
      minter: BigInt(minter.starknetContract.address),
      l1_contract: BigInt(l1nft.address),
    });

    userAddr = BigInt(user.starknetContract.address);
    minterAddr = BigInt(minter.starknetContract.address);
    nftAddr = BigInt(nft.address);
  });

  //
  // set l2Contract on l1
  //
  before(async () => {
    console.log("initializing L1 contract");
    l1nft.initialize(nft.address);
  });

  describe("bridge_to_l1", function () {
    it.only("can bridge a token from L2 -> L1 and back to L2 again", async function () {
      const token_id = 0n;
      const token_id256 = { low: 0n, high: 0n };

      console.log("Part I: Bridge from Starknet to Ethereum");

      // 1. mint an NFT on L2
      await minter.invoke(nft, "mint", { user: userAddr });

      // the owner should now be userAddr
      await expectL2Owner(token_id256, userAddr);

      // 2. bridge it to L1 (send a message)
      await user.invoke(nft, "bridge_to_l1", {
        l1_user: BigInt(l1User.address),
        token_id,
      });

      // 3. the token owner should now be the NFT contract iself
      // the owner should now be nftAddr
      console.log("  L2 owner is now the contract");
      await expectL2Owner(token_id256, nftAddr);

      // 4. grab pending L2->L1 messages
      const msgs1 = await starknet.devnet.flush();
      expect(msgs1.consumed_messages.from_l1).to.be.empty;
      const l2messages = msgs1.consumed_messages.from_l2;

      // 5. check message payload
      expect(l2messages).to.have.a.lengthOf(1);
      const [msg1] = l2messages;
      expect(BigInt(msg1.from_address)).to.equal(nftAddr);
      expectAddressEquals(msg1.to_address, l1nft.address);
      expectBigIntEquals(msg1.payload[0], l1User.address);
      expectBigIntEquals(msg1.payload[1], token_id);

      // 6. consume the message on L1
      console.log("  Consuming message on L1");
      const tx = l1nft.bridgeFromL2(l1User.address, token_id);
      await expect(tx).not.to.be.reverted;
      expect(await l1nft.ownerOf(token_id)).to.eq(l1User.address);

      console.log("Part II: Bridge back to Starknet");

      // 1. send an L1->L2 message
      await l1nft.bridgeToL2(userAddr.toString(), token_id);

      // 2. grab pending L1->L2 messages
      const msgs2 = await starknet.devnet.flush();
      expect(msgs2.consumed_messages.from_l2).to.be.empty;
      const l1messages = msgs2.consumed_messages.from_l1;

      // 3. check message payload
      expect(l1messages).to.have.a.lengthOf(1);
      const [msg2] = l1messages;
      expect(msg2.args.from_address).to.equal(l1nft.address);
      expectBigIntEquals(msg2.args.to_address, nftAddr as bigint);
      expectBigIntEquals(msg2.args.payload[0], userAddr as bigint);
      expectBigIntEquals(msg2.args.payload[1], token_id);

      // 4. owner on L2 side should now be the original user
      console.log("  L2 owner is now the original user");
      await expectL2Owner(token_id256, userAddr);

      // 5. the token has been burned on L1
      // apparently ethers.js bug
      // https://github.com/ethers-io/ethers.js/discussions/2849
      await expect(l1nft.ownerOf(token_id)).to.be.reverted; //With(
      //   "ERC721: owner query for nonexistent token"
      // );
    });
  });

  async function expectL2Owner(token_id: CairoUint256, addr: BigInt) {
    const { owner } = await nft.call("ownerOf", { token_id });
    console.log(owner);
    console.log(addr);

    expect(owner).to.equal(addr);
  }

  function expectAddressEquals(value: string, expected: string) {
    console.log(value);
    console.log(expected);
    expect(BigInt(value)).to.equal(BigInt(expected));
  }

  function expectBigIntEquals(
    value: string | bigint | number,
    expected: string | bigint | number
  ) {
    console.log(value);
    console.log(expected);
    expect(BigInt(value)).to.equal(BigInt(expected));
  }
});
