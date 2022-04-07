import abi from '@starknet-bootcamp/contracts/starknet-artifacts/contracts/Counter.cairo/Counter_abi.json';
import { useContract, useStarknetCall, useStarknetInvoke, useStarknetTransactionManager } from '@starknet-react/core';
import React, { FC, useState } from 'react';
import { Abi } from 'starknet';
import { BigNumberish } from 'starknet/dist/utils/number';
import PrimaryButton from '~/components/buttons/PrimaryButton';
import Style from './counter.module.scss';

interface Props {
  address: string
}

const Counter: FC<Props> = ({ address }) => {
  const [amount, setAmount] = useState('1');
  const { transactions } = useStarknetTransactionManager();
  const { contract: counterContract } = useContract({ abi: abi as Abi, address });
  const { data: readData, error: readError, loading: readLoading, refresh: readRefresh } = useStarknetCall({ contract: counterContract, method: 'read', args: [] });
  const { data: incData, loading: incLoading, error: incError, reset: incReset, invoke: incInvoke } = useStarknetInvoke({ contract: counterContract, method: 'increment' });
  const counterAmount = (readData || [])[0] as BigNumberish;

  const isWaitingTransaction = (txHash: string | undefined) => {
    if (txHash) {
      const transaction = transactions.find(tr => tr.transactionHash === txHash);
      return !!transaction && transaction.status !== 'ACCEPTED_ON_L1' && transaction.status !== 'ACCEPTED_ON_L2' && transaction.status !== 'REJECTED';
    }
    return false;
  }

  const handleOnIncrementClick = async () => {
    const tx = await incInvoke({args: [amount]});
    console.log(tx);
  };
  return (
    <section className="simple-container">
      <h1>Counter</h1>
      <div>
        <p>Value: {counterAmount?.toString()}</p>
          <label className={Style.labelAmount}>
            Increment amount:
            <input className={Style.inputAmount} type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
        <PrimaryButton 
          loading={
            readLoading || 
            !readData || 
            incLoading || 
            isWaitingTransaction(incData) || 
            counterAmount == undefined
          } 
          onClick={handleOnIncrementClick}
        >
          Increment
        </PrimaryButton>
      </div>
      {(!!readError || !!incError) &&
        <>
          <h2 className={Style.errorTitle}>Errors:</h2>
          {!!readError && <span className={Style.errorContent}>{readError}</span>}
          {!!incError && <span className={Style.errorContent}>{incError}</span>}
        </>
      }
    </section>
  );
};

export default Counter;
