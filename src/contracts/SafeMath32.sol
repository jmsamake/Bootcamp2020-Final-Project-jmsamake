pragma solidity >=0.4.21 <0.7.0;

/// @title library to handle safe math ops for uint32
/// @author Joseph M. Samake
/// @notice You can use this contract only for demo purposes
/// @dev implementation uses the template from OpenZeppelin: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol
library SafeMath32 {

	 function mul(uint32 a, uint32 b) internal pure returns (uint32) {
		 if (a == 0) 
		   return 0;

		 uint32 c = a * b;
		 require(c / a == b, "SafeMath32: multiplication overflow");

		 return c;
	 }

	 function div(uint32 a, uint32 b) internal pure returns (uint32) {
		require(b > 0, "SafeMath32: division by zero");
        uint32 c = a / b;

		return c;
	 }

	 function sub(uint32 a, uint32 b) internal pure returns (uint32) {
		 require(b <= a, "SafeMath32: substraction overflow");
		 uint32 c = a - b;
		 
		 return c;
	 }

	 function add(uint32 a, uint32 b) internal pure returns (uint32) {
		 uint32 c = a + b;
		 require(c >= a, "SafeMath32: addition overflow");

		 return c;
	 }
}