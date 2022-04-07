import abi from '@starknet-bootcamp/contracts/starknet-artifacts/contracts/RockPaperScissors.cairo/RockPaperScissors_abi.json';
import { useContract } from '@starknet-react/core';
import React, { FC, useState } from 'react';
import { Abi } from 'starknet';
import RpsGame from './RpsGame';

interface Props {
  address: string
}

const Rps: FC<Props> = ({ address }) => {
  const { contract } = useContract({ abi: abi as Abi, address });
  const [gameId, setGameId] = useState<number>();

  return (
    <section className="simple-container">
      <h1>Rock Paper Scissors</h1>
      {!gameId &&
        <button onClick={() => setGameId(1)}>Start Game</button>
      }
      {gameId && contract &&
        <RpsGame gameId={gameId} contract={contract} />
      }
    </section>
      
  );
};

export default Rps;
