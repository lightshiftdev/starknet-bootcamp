import { StarknetProvider } from '@starknet-react/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import React from 'react';
import RouteGuard from '~/components/RouteGuard';
import TransactionList from '~/components/TransactionList';
import getContractsAddresses from '~/hooks/GetContractsAddresses';
import '~/styles/app.css';
import Counter from './counter';
import Rps from './rps';

export default function MyApp({ Component, pageProps }: AppProps) {
  const [COUNTER_CONTRACT_ADDRESS, RPS_CONTRACT_ADDRESS] = getContractsAddresses();
  const isCounter = Component == Counter;
  const isRpc = Component == Rps;
  const address = isCounter ? COUNTER_CONTRACT_ADDRESS : isRpc ?  RPS_CONTRACT_ADDRESS : undefined;
  return (
    <StarknetProvider>
      <NextHead>
          <title>StarkNet Bootcamp Frontend :D</title>
      </NextHead>
      <RouteGuard>
        {((!isCounter && !isRpc) || address) &&
          <Component {...pageProps} address={address} />
        }
      </RouteGuard>
      <section className="simple-container">
        <TransactionList />
      </section>
    </StarknetProvider>
  )
}
