# Final projet submission: Bounty dAPP
## Joseph M SAMAKE - Consensys Bootcamp 

Description: Bounty contract implements a dAPP that allows people to post and submit for work bounties

This contract uses the following design patterns:

1.) Circuit Breaker pattern:

- a state var "stopped" is used to implement an emergency halt of the contract
- only contract owner is allowed to manipulate that state var via stopContract() 
and activateContract() functions

2.) Withdrawal pattern:

A Pull rather than Push mecanism is used to pay the bounty amounts

- a state var "mapping(address => uint256) public pendingPayOut" is used to keep track
of each bounty hunter balance; they can then proceed to withdraw those balances at a time
of their choice
- the dapp contract is used as an escrow account holding the funds owed by the bounty posters