var Bounty = artifacts.require("./Bounty.sol");
var SafeMath32 = artifacts.require("./SafeMath32.sol");
var SafeMath256 = artifacts.require("./SafeMath256.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath32);
  deployer.deploy(SafeMath256);
  deployer.link(SafeMath32, Bounty);
  deployer.link(SafeMath256, Bounty);
  deployer.deploy(Bounty);
};
