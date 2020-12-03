pragma solidity >=0.4.21 <0.7.0;


/// @title library to handle safe math ops for uint256
/// @author Joseph M. Samake
/// @notice You can use this contract only for demo purposes
/// @dev implementation uses the template from OpenZeppelin: 
//  https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol
library SafeMath256 {

	 function mul(uint256 a, uint256 b) internal pure returns (uint256) {
		 if (a == 0) 
		   return 0;

		 uint256 c = a * b;
		 require(c / a == b, "SafeMath256: multiplication overflow");

		 return c;
	 }

	 function div(uint256 a, uint256 b) internal pure returns (uint256) {
		require(b > 0, "SafeMath256: division by zero");
        uint256 c = a / b;

		return c;
	 }

	 function sub(uint256 a, uint256 b) internal pure returns (uint256) {
		 require(b <= a, "SafeMath256: substraction overflow");
		 uint256 c = a - b;
		 
		 return c;
	 }

	 function add(uint256 a, uint256 b) internal pure returns (uint256) {
		 uint256 c = a + b;
		 require(c >= a, "SafeMath256: addition overflow");

		 return c;
	 }
}