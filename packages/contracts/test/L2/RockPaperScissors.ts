import { expect } from "chai";
import { starknet } from "hardhat";
import { Account, StarknetContract } from "hardhat/types";
import { hash } from "starknet";

const ROCK = 1;
const PAPER = 2;
const SCISSORS = 3;

const TIE = 3n;
const P1 = 1n;
const P2 = 2n;

describe("RockPaperScissors", function () {
  this.timeout(60_000);

  let player1: Account;
  let player2: Account;
  let rps: StarknetContract;

  before(async () => {
    player1 = await starknet.deployAccount("OpenZeppelin");
    player2 = await starknet.deployAccount("OpenZeppelin");
  });

  // deploy RockPaperScissors
  beforeEach(async () => {
    const counterFactory = await starknet.getContractFactory(
      "RockPaperScissors"
    );
    rps = await counterFactory.deploy();
  });

  describe("play", function () {
    it("sets player1 after the first move", async () => {
      await player1.invoke(rps, "play", { game_id: 1, hashed_move: 1 });

      const { game } = await rps.call("game", { game_id: 1 });

      expect(game.player1).to.equal(BigInt(player1.starknetContract.address));
      expect(game.player2).to.equal(0n);
    });

    it("sets player2 after the second move", async () => {
      await player1.invoke(rps, "play", { game_id: 1, hashed_move: 1 });
      await player2.invoke(rps, "play", { game_id: 1, hashed_move: 2 });

      const { game } = await rps.call("game", { game_id: 1 });

      expect(game.player2).to.equal(BigInt(player2.starknetContract.address));
    });

    it("preserves player_1 after the second move", async () => {
      await player1.invoke(rps, "play", { game_id: 1, hashed_move: 1 });
      await player2.invoke(rps, "play", { game_id: 1, hashed_move: 2 });

      const { game } = await rps.call("game", { game_id: 1 });

      expect(game.player1).to.equal(BigInt(player1.starknetContract.address));
      expect(game.player2).to.equal(BigInt(player2.starknetContract.address));
    });

    it("fails if the move is 0", async () => {
      try {
        player1.invoke(rps, "play", { game_id: 1, hashed_move: 0 });
        expect(false);
      } catch {}
    });

    it("fails if player2 uses the same enc_move as player1", async () => {
      player1.invoke(rps, "play", { game_id: 1, hashed_move: 1 });

      try {
        player2.invoke(rps, "play", { game_id: 1, hashed_move: 1 });
        expect(false);
      } catch {}
    });

    it("fails if player1 tries to play twice", async () => {
      player1.invoke(rps, "play", { game_id: 1, hashed_move: 1 });

      try {
        player1.invoke(rps, "play", { game_id: 1, hashed_move: 2 });
        expect(false);
      } catch {}
    });
  });

  describe("reveal", function () {
    it("can reveal a move if (move, salt, caller) match hashed_move", async () => {
      const game_id = 1n;
      const move1 = 2n;
      const move2 = 3n;
      const salt1 = 1n;
      const salt2 = 2n;
      const hashed_move1 = hash.pedersen([
        hash.pedersen([Number(move1), Number(salt1)]),
        player1.starknetContract.address,
      ]);
      const hashed_move2 = hash.pedersen([
        hash.pedersen([Number(move2), Number(salt2)]),
        player2.starknetContract.address,
      ]);

      await player1.invoke(rps, "play", { game_id, hashed_move: hashed_move1 });
      await player2.invoke(rps, "play", { game_id, hashed_move: hashed_move2 });

      await player1.invoke(rps, "reveal", {
        game_id,
        move: move1,
        salt: salt1,
      });

      const { game } = await rps.call("game", { game_id });

      expect(game.move1).to.equal(move1);
    });

    it("does not reveal a move if the hash does not match", async function () {
      const game_id = 1n;
      const move1 = 2n;
      const move2 = 3n;
      const salt1 = 1n;
      const salt2 = 2n;
      const hashed_move1 = BigInt(
        hash.pedersen([Number(move1), Number(salt1)])
      );
      const hashed_move2 = BigInt(
        hash.pedersen([Number(move2), Number(salt2)])
      );

      await player1.invoke(rps, "play", { game_id, hashed_move: hashed_move1 });
      await player2.invoke(rps, "play", { game_id, hashed_move: hashed_move2 });

      await player1.invoke(rps, "reveal", {
        game_id,
        move: move1,
        salt: 3n,
      });

      const { game } = await rps.call("game", { game_id });

      expect(game.move1).to.equal(0n);
    });
  });

  describe("compute_winner", function () {
    it("computes all scores correctly", async function () {
      const rock_rock = await rps.call("compute_winner", {
        move1: ROCK,
        move2: ROCK,
      });
      const paper_paper = await rps.call("compute_winner", {
        move1: PAPER,
        move2: PAPER,
      });
      const scissors_scissors = await rps.call("compute_winner", {
        move1: SCISSORS,
        move2: SCISSORS,
      });
      const rock_paper = await rps.call("compute_winner", {
        move1: ROCK,
        move2: PAPER,
      });
      const rock_scissors = await rps.call("compute_winner", {
        move1: ROCK,
        move2: SCISSORS,
      });
      const paper_rock = await rps.call("compute_winner", {
        move1: PAPER,
        move2: ROCK,
      });
      const paper_scissors = await rps.call("compute_winner", {
        move1: PAPER,
        move2: SCISSORS,
      });
      const scissors_rock = await rps.call("compute_winner", {
        move1: SCISSORS,
        move2: ROCK,
      });
      const scissors_paper = await rps.call("compute_winner", {
        move1: SCISSORS,
        move2: PAPER,
      });

      expect(rock_rock.winner).to.equal(TIE);
      expect(paper_paper.winner).to.equal(TIE);
      expect(scissors_scissors.winner).to.equal(TIE);
      expect(rock_paper.winner).to.equal(P2);
      expect(rock_scissors.winner).to.equal(P1);
      expect(paper_rock.winner).to.equal(P1);
      expect(paper_scissors.winner).to.equal(P2);
      expect(scissors_rock.winner).to.equal(P2);
      expect(scissors_paper.winner).to.equal(P1);
    });
  });
});
