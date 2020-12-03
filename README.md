# Final projet submission: Bounty dAPP
## Joseph M SAMAKE - Consensys Bootcamp 2020

Description: Bounty contract implements a dAPP that allows people to post and submit for work bounties

Use cases:

Job/bounty poster
1. create work bounties; the same user can create 1 or more bounties; several different user can post bounties
2. a work bounty will have a jb/work description and a bounty payout amount
3. User can view a listing of all the bounties he posted
4. User can review the work submissions proposed for his bounty
5. User can accept or reject a given work submission
6. Accepting a work submission will automatically pay the submitter the amount proposed for the bounty

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
   