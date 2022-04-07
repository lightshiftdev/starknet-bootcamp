import { Transaction, useStarknetTransactionManager } from '@starknet-react/core';
import React from 'react';
import Style from './transaction-list.module.scss';

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  return (
    <span>
      {transaction.transactionHash} - {transaction.status}
    </span>
  );
}

const TransactionList = () => {
  const { transactions } = useStarknetTransactionManager();
  if (!transactions.length) {
    return null;
  }
  return (
    <>
      <h2 className={Style.title}>Transactions:</h2>
      <ul className={Style.list}>
        {[...transactions].reverse().map((transaction, index) => (
          <li key={index}>
            <TransactionItem transaction={transaction} />
          </li>
        ))}
      </ul>
    </>
  );
}
export default TransactionList;
