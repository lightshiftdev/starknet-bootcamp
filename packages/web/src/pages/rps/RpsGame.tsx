import {
  useStarknet,
  useStarknetCall,
  useStarknetInvoke,
  useStarknetTransactionManager
} from "@starknet-react/core";
import BN from 'bn.js';
import React, { FC, useEffect, useState } from "react";
import { Contract, hash } from "starknet";
import Spinner from "~/components/Spinner";
import Styles from './rps-game.module.scss';

enum Move {
  ROCK = 1,
  PAPER = 2,
  SCISSORS = 3,
}

interface Props {
  gameId: number,
  contract: Contract
}

interface Game {
  player1: BN,
  player2: BN,
  move1: BN,
  move2: BN,
  hashed_move1: BN,
  hashed_move2: BN,
  winner: BN
}

const RpsGame: FC<Props> = ({ gameId, contract }) => {
  const { account } = useStarknet();
  const { transactions } = useStarknetTransactionManager();
  const [move, setMove] = useState<Move>();
  const { data, loading } = useStarknetCall({ contract, method: 'game', args: [gameId] });
  const { data: playData, error: playError, loading: playLoading, invoke: play } = useStarknetInvoke({ contract, method: 'play' });
  const { data: revealData, error: revealError, loading: revealLoading, invoke: reveal } = useStarknetInvoke({ contract, method: 'reveal' });
  const { data: finishData, error: finishError, loading: finishLoading, invoke: finish } = useStarknetInvoke({ contract, method: 'finish' });
  let game: Game | undefined = undefined;
  const [player, setPlayer] = useState<1|2>();
  const salt = player || 0;
  if (!!data && !!data[0]) {
    game = data[0] as Game;
  }

  useEffect(() => { // auto select players if the game already started
    if (game && account && (game.player1 || game.player2)) {
      if (BigInt(game.player1.toString()) === BigInt(account)) {
        setPlayer(1);
       }
       if (BigInt(game.player2.toString()) === BigInt(account)) {
        setPlayer(2);
       }
    }
  }, [game]);

  let hashedMove: BN, hashedAdversaryMove: BN;
  let savedMove: BN, adversaryMove: BN;
  if (player && game) {
    hashedMove = game[`hashed_move${player}`];
    hashedAdversaryMove = game[`hashed_move${player === 1 ? 2 : 1}`];
    savedMove = game[`move${player}`];
    adversaryMove = game[`move${player === 1 ? 2 : 1}`];
  }

  const handleOnMakeAMove = (newMove: number) => {
    setMove(move);
    const hashedMove = hash.pedersen([new BN(newMove), new BN(salt)]);
    console.log(new BN(newMove), new BN(salt));
    play({ args: [gameId, hashedMove] });
  }

  const handleOnMoveReveal = () => {
    reveal({ args: [gameId, player === 1 ? Move.ROCK : Move.PAPER, salt] });
  };

  const isWaitingTransaction = (txHash: string | undefined) => {
    if (txHash) {
      const transaction = transactions.find(tr => tr.transactionHash === txHash);
      return !!transaction && transaction.status !== 'ACCEPTED_ON_L1' && transaction.status !== 'ACCEPTED_ON_L2' && transaction.status !== 'REJECTED';
    }
    return false;
  }

  const handleOnRevealWinner = () => {
    finish({args: [gameId]});
  }

  const renderGame = () => {
    if (!game) {
      return null;
    }
    /* if (!player) {
      return (
        <>
          <button onClick={() => setPlayer(1)}>Player 1</button>
          <button onClick={() => setPlayer(2)}>Player 2</button>
        </>
      );
    } */
    if (!hashedMove || hashedMove.eqn(0)) {
      return (
        <>
          <button onClick={() => handleOnMakeAMove(Move.ROCK)}>Rock</button>
          <button onClick={() => handleOnMakeAMove(Move.PAPER)}>Paper</button>
          <button onClick={() => handleOnMakeAMove(Move.SCISSORS)}>Scissors</button>
        </>
      );
    }
    if (!hashedMove.eqn(0) && hashedAdversaryMove.eqn(0)) {
      return (
        <div className={Styles.waiteAMove}>
          <p>Waiting for adversary to make is move...</p>
          <Spinner />
        </div>
      );
    }
    if (savedMove.eqn(0)) {
      return (
        <div className={Styles.waiteAMove}>
          <p>Reveal your move:</p>
          <button onClick={handleOnMoveReveal}>Reveal</button>
        </div>
      );
    }
    if (adversaryMove.eqn(0)) {
      return (
        <div className={Styles.waiteAMove}>
          <p>Waiting for adversary to reveal is move...</p>
          <Spinner />
        </div>
      );
    }
    if (!finishData) {
      <button onClick={handleOnRevealWinner}>Reveal winner</button>
    }
    if (player) {
      return (
        <div className={Styles.waiteAMove}>
         {game.winner.eqn(3) ? 
         <h3>It's a Tie :/</h3>
         :
         <h3>You {game.winner.eqn(player) ? 'Win :)' : 'Lose :('}</h3>
         }
        </div>
      );
    }
  };

  console.log(game);

  const renderPlayer = () => {
    if (player) {
      return <h4>Player {player}</h4>
    }
    return null;
  }

  return (
    <>
      {renderPlayer()}
      <div className={Styles.gameBoard}>
        {
          !game ||
          loading ||
          playLoading ||
          revealLoading ||
          isWaitingTransaction(playData) ||
          isWaitingTransaction(revealData) ||
          isWaitingTransaction(finishData) ? <Spinner /> : renderGame()}
      </div>
      {(!!playError || !!revealError || !!finishError) &&
        <>
          <h2 className={Styles.errorTitle}>Errors:</h2>
          {!!playError && <span className={Styles.errorContent}>{playError}</span>}
          {!!revealError && <span className={Styles.errorContent}>{revealError}</span>}
          {!!finishError && <span className={Styles.errorContent}>{finishError}</span>}
        </>
      }
    </>
  );
};

export default RpsGame;
