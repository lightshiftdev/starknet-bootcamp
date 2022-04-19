# Starknet Bootcamp - DevConnect Amsterdam 2022

[asdf]: https://github.com/asdf-vm/asdf
[install-docker]: https://docs.docker.com/get-docker/
[starknet-devnet]: https://github.com/Shard-Labs/starknet-devnet
[ganache]: https://github.com/trufflesuite/ganache
[lightshift]: https://www.lightshift.capital/
[notion]: https://lightshiftcapital.notion.site/StarkNet-Bootcamp-Amsterdam-0cdb4c74cdbb4680863ac12eada0ab30
[hackathon]: https://starknet.io/latest-updates/starknet-hackathon-amsterdam/
[hardhat]: hardhat.org/
[next.js]: https://nextjs.org/
[ganache]: https://trufflesuite.com/ganache/index.html
[devnet]: https://github.com/Shard-Labs/starknet-devnet
[faucet]: https://faucet.goerli.starknet.io/
[slides1]: https://docs.google.com/presentation/d/1hOXJYoOOqc2YS9oOlc6XrLUxX6ia2MsUkJySiaP8AD0/edit?usp=sharing
[explorer]: https://goerli.voyager.online/
[cairo-playground]: https://www.cairo-lang.org/playground/
[starknet-playground]: https://starknet.io/playground/

![Starknet Logo](./assets/starknet-logo.png)

Welcome to the official repo for the [Starknet Bootcamp @ DevConnect][notion].

If you're here, it's likely you signed up to join us at DevConnect Amsterdam
2022 (or you just stumbled upon, which is fine too).

Details on the bootcamp itself are provided in the [Notion page][notion].

This repo is your main tool to get going through the bootcamp, and hopefully
teach you all the practical details programming in Starknet, ahead of the
[Starknet Hackathon][hackathon].

It consists of three main components:

- _packages/contracts_ a Hardhat project, with all the starknet goodness
  pre-installed, and some sample code;
- _packages/web_ A next.js app ready to interact with starknet contracts;
- _docker-compose.yml_ A docker setup that makes it easy to manage the Starknet
  & Ethereum nodes required for development.

The entire project is intended for local development only (We use
[starknet-devnet][starknet-devnet] and [Ganache][ganache] instead of testnets),
and favors JavaScript tooling instead of Python. We opted for this since that's
what most commonly known by Solidity developers, which according to sign ups,
make up the vast majority of this bootcamp.

# Useful links

[Bootcamp slides - Day 1][slides1]
[Goerli Faucet][faucet]
[Voyager Explorer][explorer]
[Cairo playground][cairo-playground]
[Starknet playground][starknet-playground]

# Setup Guide

Follow these steps to setup the repo and get ready for the bootcamp

- [1. Clone the repo](#1-clone-the-repo)
- [2. Install requirements](#2-install-requirements)
- [3. Install packages](#3-install-packages)
- [4. Compile the contracts](#4-compile-the-contracts)
- [5. Start the development nodes](#5-start-the-development-nodes)
- [6. Run the test suite](#6-run-the-test-suite)
- [7. Bonus: Get the UI running](#7-bonus-get-the-ui-running)

### 1. Clone the repo

```bash
git clone git@github.com/lighshiftdev/starknet-bootcamp
cd starknet-bootcamp
git submodule init && git submodule update
```

### 2. Install Requirements

- **NodeJS**. Version 16.x recommended. Use your OS's package manager, or a tool such as [asdf][asdf]
- **Docker**. Follow the [appropriate instructions for your OS][install-docker]

### 3. Install packages

```bash
# Install dependencies
yarn install
```

### 4. Compile the contracts

```bash
yarn run compile
```

### 5. Start the development nodes

While in the repository's root directory, `docker-compose up -d` will spin up two containers:

- [`starknet-devnet`][starknet-devnet]
- [`ganache`][ganache]

### 6. Run the test suite

```bash
yarn run test
```

If you get only green tests here, it means you're done and ready to rock 🚀

### 7. Deploy to local nodes

```bash
yarn run deploy:starknet:devnet
```

### 8. Bonus: Get the UI running

```bash
yarn ui:start
```

And go to `http://localhost:3000`.

## Your (future) tasks

The repository is already setup with a sample `Counter` contract, as well as an `NFT`, and some boilerplate code that will be useful for future tasks.

During the bootcamp, we'll start by getting familiar with cairo code, by doing a code walkthrough of both `Counter` and `NFT`

Your task will be to implement a Rock Paper Scissor game with the following mechanics:

1. Provide the ability for two players to compete in a rock paper scissor game
2. The winner of a game is gifted with a newly minted NFT
3. This NFT can later be transfered to an L1 contract throught using cross-chain messaging.

# About

This repository was put together with love by [Lightshift
Capital][lightshift].
