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
  beforeEach(async () => {
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
  beforeEach(async () => {
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
  beforeEach(async () => {
    console.log("initializing L1 contract");
    l1nft.initialize(nft.address);
  });

  describe("bridge_to_l1", function () {
    it.skip("can bridge a token from L2 -> L1 and back to L2 again", async function () {
      //
      // TODO
      //
    });
  });
});
