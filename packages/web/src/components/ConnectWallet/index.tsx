import { getStarknet } from "@argent/get-starknet";
import { InjectedConnector, useStarknet } from '@starknet-react/core';
import React, { FC, useState } from "react";
import PrimaryButton from "../buttons/PrimaryButton";
const starknetA = getStarknet();

interface Props {}

const ConnectWallet: FC<Props> = () => {
  const { connect } = useStarknet();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <PrimaryButton 
        onClick={() => {
          setLoading(true);
          try {
            connect(new InjectedConnector({ showModal: true }));
          } catch(e) {
            console.error(e);
          }
          setLoading(false);
        }}
        loading={loading}
      >
        Connect to wallet
      </PrimaryButton>
    </>
  );
};

export default ConnectWallet;
