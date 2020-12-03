# Final projet submission: Bounty dAPP
## Joseph M SAMAKE - Consensys Bootcamp 

Description: Measures against common attacks

This contract uses features against the following security vulnarabilities:

1.) Integer Overflow & Underfow:

- uses SafeMath libraries for all uint32 & uint256 operations to prevent such attacks


2.) Denial of Service:

A Pull rather than Push mecanism is used to pay the bounty amounts (Withdrawal pattern)

- prevents DoS attack as funds deposit & withdrawal are separated

3.) Re-entrancy attack:

- use Conditions | Effect | Interactions pattern prior to any external calls such funds withdrawals