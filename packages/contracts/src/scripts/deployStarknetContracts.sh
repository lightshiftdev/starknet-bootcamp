#!/bin/sh

mkdir -p starknet-deployments/$1

# Counter.new(initial=10, max=5)
counter=$(npx hardhat starknet-deploy --starknet-network $1 --wait starknet-artifacts/contracts/Counter.cairo/ --inputs "10 5")
address=$(echo -e "$counter" | grep "Contract address" | awk 'NF{print $NF}')
echo '{ "address": "'$address'" }' > starknet-deployments/$1/Counter.json