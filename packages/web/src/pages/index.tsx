import { useStarknet } from '@starknet-react/core';
import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';
import networkExampleImg from '~/assets/images/wallet-network-example.png';
import ConnectWallet from '~/components/ConnectWallet';
import getContractsAddresses from '~/hooks/GetContractsAddresses';

type Props = {}

const Home: FC<Props & NextPage> = () => {
  const [COUNTER_CONTRACT_ADDRESS, RPS_CONTRACT_ADDRESS] = getContractsAddresses();
  console.log(COUNTER_CONTRACT_ADDRESS, RPS_CONTRACT_ADDRESS);
  const router = useRouter();
  const { account } = useStarknet();
  if (router.query.returnUrl && account) {
    router.push({
      pathname: router.query.returnUrl as string,
    });
  }
  
  const renderExercisesButtons = () => {
    return [(
      <div key="counter">
        <h4>
          #1 Exercise
        </h4>
        {COUNTER_CONTRACT_ADDRESS ? (
          <Link key="counterButton" href="/counter">
            <a>Counter</a>
          </Link>
        ) : (
          <p>After deploying the Counter contract in your local node make sure you past the address to <strong>constants/contracts.ts</strong></p>
        )}
      </div>
    ), (
      <div key="rpc">
        <h4>
          #2 Exercise
        </h4>
        {RPS_CONTRACT_ADDRESS ? (
          <Link key="rps" href="/rps">
            <a>Rock Paper Scissors</a>
          </Link>
        ) : (
          <p>After deploying the Rock Paper Scissors contract in your local node make sure you past the address to <strong>constants/contracts.ts</strong></p>
        )}
      </div>
    )];
  };

  const renderConnectContent = () => {
    return (
      <>
        <p>Do you have argent-x wallet extension installed? You'll need that to continue, here you have it:</p>
        <a href="https://chrome.google.com/webstore/detail/argent-x-starknet-wallet/dlcobpjiigpikoobohmabehhmhfoodbb" target="_blank" className="download-button">
          <img src="https://argentwebsite.cdn.prismic.io/argentwebsite/2a59b435-65f7-4fd5-962d-543ff6bbac5d_button-download-starknet.svg" alt="Download Argent X StarkNet browser wallet" />
        </a>
        <p>After that make sure you have an account deployed (yap, the wallet is a smart contract) and make sure you are in the right network:</p>
        <Image src={networkExampleImg} alt="wallet network selector example" />
        <p>And last but not least, connect your dApp to your wallet:</p>
        <ConnectWallet />
      </>
    );
  };
  const renderDappContent = () => {
    return (
      <div>
        <p>Starknet Account: { account }</p>
        <div className="exercises-info">
          {renderExercisesButtons()}
        </div>
      </div>
    );
  };
  return (
    <section className="simple-container">
      <h1>Starknet bootcamp :D</h1>
      {!!account ? renderDappContent() : renderConnectContent()}
    </section>
  )
}

export default Home
