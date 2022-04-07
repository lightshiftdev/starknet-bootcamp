import { useCallback, useEffect, useState } from 'react';

const getContractsAddresses = () => {
  const network = 'devnet';
  const [counterAddress, setCounterAddress] = useState<string>();
  const [rpsAddress, setRpsAddress] = useState<string>();
  
  const loadCounterAddress = useCallback(async () => {
    try {
      const counter = await import(`@starknet-bootcamp/contracts/starknet-deployments/${network}/Counter.json`);
      setCounterAddress(counter.address);
    } catch (e) {
      console.log(e);
    }
  }, [setCounterAddress, network]);
  const loadRpsAddress = useCallback(async () => {
    try {
      const rps = await import(`@starknet-bootcamp/contracts/starknet-deployments/${network}/RockPaperScissors.json`);
      setRpsAddress(rps.address);
    } catch (e) {
      console.log(e);
    }
  }, [setRpsAddress, network]);
  
  useEffect(() => {
    loadCounterAddress();
    loadRpsAddress();
  }, [loadCounterAddress, loadRpsAddress]);
  return [counterAddress, rpsAddress] as const;
}

export default getContractsAddresses;
