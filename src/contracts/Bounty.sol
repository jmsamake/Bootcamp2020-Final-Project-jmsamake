pragma solidity >=0.4.21 <0.7.0;

import "./SafeMath32.sol";
import "./SafeMath256.sol";

/// @title A contract to handle bounties for work items
/// @author Joseph M. Samake - Final project - Consensys Bootcamp Nov. 2020
/// @notice You can use this contract only for demo purposes
/// @dev this contract implements a circuit-braker pattern and SafeMath libs
contract Bounty {

  using SafeMath32 for uint32;
  using SafeMath256 for uint256;
  
  /* State variables */
 
  // represents the current index of the bounty counter
  uint32 public bountyIndex = 0;
  // rep the owner of this contract at deploy time
  address public owner;
  // used for circuit-breaker pattern
  bool public stopped = false;

  /* This struct encapsulates the items needed to describe a submission for a work bounty
     - submitter: is the address (EOA) of the person submitting the work
     - submission: is the actual work submission 
  */
  struct WorkSubmission{
    address submitter;
    string submission;
  }
  
  /* This struct encapsulates the items needed to describe a work bounty   */
  struct WorkItem {
    uint32 bountyId;              // an id given to the created bounty
    address poster;               // the address (EOA) of the person posting the work bounty
    string jobDescription;        // the job description of the work
    uint256 payoutAmount;         // the amount to be paid when the submission is accepted, in ETH by default
    string payoutType;            // the type of payout: ie ETH vs other token; not used this version
    uint datePosted;              // date the work bounty was posted; not used this version
    uint dateAccepted;            // date submission is accepted by the bounty poster; not used this version
    bool accepted;                // status of work bounty: already accepted or not
    address payable bountyWinner; // payable address (EOA) of the bounty winner
  }

  // maps all bountyid to workitem; this list has a record of all the bounties handled in this contract
  mapping(uint32 => WorkItem) public bountyList;
  // maps a given bountyid to worksubmissions submitted for it; i.e they can be several submissions for the same bounty
  mapping(uint32 => WorkSubmission[]) public submissionList;
  // maps bounty posters to the bountyid they've created
  mapping(address => uint32[]) public jobPosters;
  // maps jobhunters to the bountyid they've submitted for
  mapping(address => uint32[]) public jobHunters;
  // tracks all balances for winning jobhunters
  mapping(address => uint256) public pendingPayOut;
  
  /* Events */

  // emitted when a work bounty is posted
  event BountyPosted(
    uint32 _bountyId,
    address indexed poster,
    uint256 payoutAmount  
  );
  
  // emitted when a work bounty is accepted by a submitter
  event WorkAccepted(
    uint32 _bountyId,
    address indexed submitter
  );
  // emitted when a bounty hunter withdraws his earnings
  event PaymentWithdrawn(
    address indexed submitter,
    uint256 bountyAmount 
  );
  // emitted when the contract is stopped in emergency by admin or owner
  event StopContract(
    address indexed owner   
  );
  // emitted when the contract is re-activated after an emergency stop by admin or owner
  event ActivateContract(
    address indexed owner   
  );

  /* Modifiers */

  // applies to function which must be deactivated in emergency stop
  modifier stopInEmergency { require(!stopped); _; }
  // applies to function can operate while in emergency stop
  modifier onlyInEmergency { require(stopped); _; }
  // applies to acceptWork function to insure that enough value was sent to cover the bounty.
  modifier paidEnough(uint256 _amount) { 
    require(msg.value >= _amount); 
    _; 
  }

  constructor() public {
		 owner = msg.sender;
  }

  // accepts eth funds by default; used as an escrow to hold bounty posters funds
  function () external payable {}


  /// @notice Emergency stop contract in circuit-breaker pattern
  /// @dev account which deployed the contract is considered the owner thats's allowed to manipulate the stopped state var
  function stopContract() public {
     require(msg.sender == owner);
     stopped = true;
     emit StopContract(owner);
  }

  /// @notice re-activate contract in circuit-breaker pattern
  /// @dev account which deployed the contract is considered the owner thats's allowed to manipulate the stopped state var
  function activateContract() public {
     require(msg.sender == owner);
     stopped = false;
     emit ActivateContract(owner);
  }


  /// @notice Create and post a new work bounty
  /// @dev fonction is deactivated in emergency stop procedure via the stopInEmergency modifier
  /// @param _jd: The job/work description for the bounty
  /// @param _payoutAmount: The payout amount for the bounty
  /// @param _payoutType: specified if a different currency is used instead of native ETH
  /// @return success: boolean for successful operation or not
  function createBounty(string memory _jd, uint256 _payoutAmount, string memory _payoutType) 
           stopInEmergency public returns (bool) {
   
    // do some SC side validations
    // insure job descrp & payout amount are valid
    if ( bytes(_jd).length < 1 ||  !(_payoutAmount > 0))
       return false;

    address _trxSender = msg.sender;

    bountyList[bountyIndex] = WorkItem({
              bountyId: bountyIndex,
              poster: _trxSender,
              jobDescription: _jd,
              payoutAmount: _payoutAmount,
              payoutType: _payoutType,
              datePosted: block.timestamp,
              dateAccepted: 0,
              accepted: false,
              bountyWinner: address(0)
          });
      
    // push bounty to specific job poster
    jobPosters[_trxSender].push(bountyIndex);
    emit BountyPosted(bountyIndex, _trxSender, _payoutAmount);

    // use safemath lib to incr bounty index/count
    bountyIndex = bountyIndex.add(1);

    return true;
  }
  

  /// @notice retrieves the list of bounties assigned to a given jobposter, the caller
  /// @dev the uint32[] represents the unique id, not necessarily sequential, assigned to each bounty posted by the caller
  /// @return uint32[]: array of bountyid's
  function viewMyBounties() public view returns (uint32[] memory) {
    return jobPosters[msg.sender];
  }

  /// @notice retrieves the number of submissions posted for a given work bounty
  /// @dev WorkSubmission[] is a dynamic array, so we must get length at runtime
  /// @param _bountyid: the id of the work bounty being considered
  /// @return uint32: the number of work submissions for a given work bounty
  function getNumberOfSubsForBounty(uint32 _bountyid) public view returns (uint32) {
    WorkSubmission[] storage tp  = submissionList[_bountyid];

    return uint32(tp.length);
  }

  /// @notice allows a bounty hunter to submit a work proposal
  /// @dev fonction is deactivated in emergency stop procedure via the stopInEmergency modifier
  /// @param _bountyId: the bounty id being submitted for
  /// @param _workSubmission: the description of the work proposal
  /// @return success: boolean for successful operation or not
  function submitWork(uint32 _bountyId, string memory _workSubmission) stopInEmergency public returns (bool success) {
     success = false;
     // verify that work is NOT submitted for already closed bounty
     // verify the submitter is NOT the poster of the bounty
     if (bountyList[_bountyId].accepted || bountyList[_bountyId].poster == msg.sender) {      
       success = false;
     }
     else {
        submissionList[_bountyId].push(WorkSubmission({submitter: msg.sender, submission: _workSubmission}));
        success = true;
     }

  }

  /// @notice allows a job poster to accept a work proposal submitted by a job hunter
  /// @dev this fonction receives the ETH amount corresponding to the proposed bounty amount on behalf of the contract
  /// @param _bountyId: the bounty id for which the work is being accepted
  /// @param _jobHunter: the address of the work submitter
  /// @return success: boolean for successful operation or not
  function acceptWork(uint32 _bountyId, address payable _jobHunter) public payable paidEnough(bountyList[_bountyId].payoutAmount) returns (bool success) {
     success = false;
        
     // verify that only the bounty creator can accept the work for it
     // verify that the bounty is not already accepted
     if ((msg.sender == bountyList[_bountyId].poster) && !bountyList[_bountyId].accepted) {
       bountyList[_bountyId].bountyWinner = _jobHunter;
       bountyList[_bountyId].accepted = true;
       bountyList[_bountyId].dateAccepted = block.timestamp;
       // Register bounty amount to bounty hunter :: use Pull vs Push pattern for bounty hunters            
       // Use SafeMath
       pendingPayOut[_jobHunter] = pendingPayOut[_jobHunter].add(bountyList[_bountyId].payoutAmount);
       
       emit WorkAccepted(_bountyId, _jobHunter);
       success = true;      
     }    
  }


  /// @notice allows a bounty hunter to withdraw his cumulated earnings
  /// @dev We're using a Pull instead of a Withdrawal pattern, allowing job hunters to withdraw their earnings on demand
  /// @return uint256: payout just withdrawn expressed in unit of currency
  function withdrawMyPayout() public returns (uint256) {
     
     address tempAddr = msg.sender;
     uint256 ethAmount = pendingPayOut[tempAddr];
     if (ethAmount == 0)
       return 0;

     // Effects prior to Interaction, prevent Re-Entrancy attack
     pendingPayOut[tempAddr] = 0; 
     // convert to Wei, use SafeMath lib to prevent overflow
     uint256 weiAmount = ethAmount.mul(10**18); 
     // transfer amount to bounty winner
     (bool success, ) = tempAddr.call.value(weiAmount)("");
     require(success, "Transfer to bounty winner failed!!!"); 
     emit PaymentWithdrawn(tempAddr, ethAmount);

     return ethAmount;
  }
  
// End of Contract  
}