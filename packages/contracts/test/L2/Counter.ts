import { starknet } from "hardhat";
import { expect } from "chai";
import { StarknetContract } from "hardhat/types";

describe("Counter", function () {
  this.timeout(30_000);

  let contract: StarknetContract;

  beforeEach(async () => {
    const counterFactory = await starknet.getContractFactory("Counter");
    contract = await counterFactory.deploy({ initial: 10, max: 100 });
  });

  it("start with the initial value", async () => {
    const { value } = await contract.call("read");
    expect(value).to.equal(10n);
  });

  it("can increment by the given argument", async () => {
    await contract.invoke("increment", { inc: 5 });

    const { value } = await contract.call("read");
    expect(value).to.equal(15n);
  });

  it("cannot increment by an amount larger than the cap", async () => {
    try {
      await contract.invoke("increment", { inc: 101 });
      expect(false);
    } catch (err: any) {
      expect(err.toString()).to.include("is out of range");
    }
  });
});
