# Final projet submission: Bounty dAPP
## Joseph M SAMAKE - Consensys Bootcamp 2020

Description: Bounty contract implements a dAPP that allows people to post and submit for work bounties

Use cases:

Job/bounty poster:
1. create work bounties; the same user can create 1 or more bounties; several different user can post bounties
2. a work bounty will have a jb/work description and a bounty payout amount
3. User can view a listing of all the bounties he posted
4. User can review the work submissions proposed for his bounty
5. User can accept or reject a given work submission
6. Accepting a work submission will automatically pay the submitter the amount proposed for the bounty
7. bounty is closed once the work is accepted

Job/bounty hunter:
1. can submit work for any of the bounties listed on the system;
2. can submit several proposals for the same bounty;
3. is automatically paid the bounty upon his work accepted by a poster.

## directory structure

project follows Truffle/React structure:

- /migrations : holds the migrations files
- /node_modules: holds the node js pre-reqs modules
- /public: holds the static frontend resources
- /test: holds the test file
- /src: holds all the sources files 
	/components: holds the React component files
	/contracts: holds the solidity contracts files
	/abis: holds the compile abi's (this path is setup in truffle-config.js)

# Installation

Assumes that Nodejs and truffle is installed on your system

cd to root of project

# install pre-req packages into node_modules
$ npm install 


# build and run project locally
- start ganache (cli or gui)

$ truffle compile
$ truffle migrate --reset
$ yarn start   # will launch the client on http://localhost:3000/  

*Note: insure that you have your acconts from ganache connected on metamask to test the frontend.
You can use 2 acconts, one acting as a job poster et the other as a job hunter

# run project by connecting to Rinkeby testnet
- insure your metamask account is connected to Rinkeby
- $ yarn start   # will launch the client on http://localhost:3000/ 
- app will interact w/ contract in Rinkeby @ address: 0x22E09EA75D2E179380ee06ddc48d415E349Ca7F8
- you can check the tansactions on https://rinkeby.etherscan.io/

   
