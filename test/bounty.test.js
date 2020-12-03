/*

The public version of the file used for testing can be found here: 

*/

const SafeMath32 = artifacts.require('./SafeMath32.sol')
const SafeMath256 = artifacts.require('./SafeMath256.sol')
const Bounty = artifacts.require('./Bounty.sol')

let BN = web3.utils.BN
let catchRevert = require("./exceptionsHelpers.js").catchRevert

contract('Bounty', function(accounts) {

    const owner = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]
	const charles = accounts[3]
	const joseph = accounts[4]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    let instance

    /*before(async () => {
	    instance = await Bounty.deployed()
	}) */

    // create a new contract b4 each test run
    beforeEach(async () => {
        //instance = await Bounty.new()
        //await instance.sendTransaction({from: owner, value: 5*10**18});
        instance = await Bounty.new()
    }) 

    it("T1::createBounty()", async() => {  
        const txCreate1 = await instance.createBounty("Job Description from", 3, "ETH", {from: alice})  //           
        var bountyIdx = await instance.bountyIndex()
		const workItem = await instance.bountyList(0)
		var eventEmitted = false
		if (txCreate1.logs[0].event == "BountyPosted") {
            eventEmitted = true
        }
        assert.equal(eventEmitted, true, 'Creating a bounty should emit a BountyPosted event')

        assert.equal(bountyIdx, Number(new BN(1)), 'Bounty id was NOT incremented')
		assert.equal(workItem.bountyId, 0, 'Bounty Id should be zero for the 1st item')
		assert.equal(workItem.poster, alice, 'Alice should be the job poster')
		assert.equal(workItem.accepted, false, 'Work should not be accepted yet')

		// verify that we cannot create a bounty w/ a empty work description
		const txCreate2 = await instance.createBounty("", 5, "ETH", {from: alice}) 
		eventEmitted = true                  
		if (txCreate2.logs[0] == undefined) {
            eventEmitted = false
        } 
        assert.equal(eventEmitted, false, 'Creating a bounty with an empty JD should NOT emit an event')
        // verify that we cannot create a bounty w/ a zero payout
        const txCreate3 = await instance.createBounty("Job Description from", 0, "ETH", {from: alice})
		eventEmitted = true
		if (txCreate3.logs[0] == undefined) {
            eventEmitted = false
        } 
        assert.equal(eventEmitted, false, 'Creating a bounty with a zero payout should NOT emit an event')
    })
	
	it("T2::viewMyBounties()", async() => {
		await instance.createBounty("Job Description 1 from Alice", 1, "ETH", {from: alice}) 
		await instance.createBounty("Job Description 1 from Bob", 1, "ETH", {from: bob})
		await instance.createBounty("Job Description 2 from Alice", 2, "ETH", {from: alice})		 
		await instance.createBounty("Job Description 2 from Bob", 2, "ETH", {from: bob})

        const aliceList = await instance.viewMyBounties({from: alice})  		
		assert.equal(aliceList[0], 0, 'Bounty Id should be 0 for Alice 1st item')
		assert.equal(aliceList[1], 2, 'Bounty Id should be 2 for Alice 2nd item')

		const bobList = await instance.viewMyBounties({from: bob})  		
		assert.equal(bobList[0], 1, 'Bounty Id should be 1 for Bob 1st item')
		assert.equal(bobList[1], 3, 'Bounty Id should be 3 for Bob 2nd item')
    })
	
	// Test creation of several bounties by the same poster; test the submission of one hunter to several bounties
	it("T3::submitWork() & submissionList", async() => {
		// Alice creates 2 bounties; Joseph creates 1 bounty
		await instance.createBounty("Job Description from Alice - JD0", 1, "ETH", {from: alice}) 
		await instance.createBounty("Job Description from Alice - JD1", 1, "ETH", {from: alice}) 
		await instance.createBounty("Job Description from Joseph - JD0", 1, "ETH", {from: joseph})
		// Bob submits for bountyid 0 & 1, Charles submits for bountyid 0 & 1
        await instance.submitWork(0, "Submission for Alice JD0 by Bob", {from: bob}) 
		await instance.submitWork(0, "Submission for Alice JD0 by Charles", {from: charles})	
		await instance.submitWork(1, "Submission for Joseph JD0 by Charles", {from: charles})
		// work submission list
		const workSub1 = await instance.submissionList(0,0)	
		const workSub2 = await instance.submissionList(0,1)	
		const workSub3 = await instance.submissionList(1,0)
				
		assert.equal(workSub1.submitter, bob, 'Bob should be the submitter for workItem')
		assert.equal(workSub1.submission, "Submission for Alice JD0 by Bob", 'this is not Bob submission for workItem')
		//
		assert.equal(workSub2.submitter, charles, 'Charles should be the submitter for workItem')
		assert.equal(workSub2.submission, "Submission for Alice JD0 by Charles", 'this is not Charles submission for workItem')	
		//
		assert.equal(workSub3.submitter, charles, 'Charles should be the submitter for this workItem')
		assert.equal(workSub3.submission, "Submission for Joseph JD0 by Charles", 'this is not Charles submission for workItem')
    })

    it("T4::acceptWork()", async() => {
		await instance.createBounty("Job Description from Alice", 2, "ETH", {from: alice})
		// work submission from 2 jobhunters
		const submit1 = await instance.submitWork(0, "Submission for Alice JD by Bob", {from: bob})
		const submit2 = await instance.submitWork(0, "Submission for Alice JD by Charles", {from: charles})
		//
		const weiValue = 2*(10**18) //toWei
        await instance.acceptWork(0, bob, {from: alice, value: weiValue})

        const payout = await instance.pendingPayOut(bob)
        const workItem = await instance.bountyList(0)		

        assert(workItem.accepted, 'Work should BE accepted')
		assert.equal(payout, 2, 'Payout amount should be 5 units')
    })	

    it("T5::stopContract()", async() => {
    	// Alice creates 2 bounties; 
		await instance.createBounty("Job Description from Alice - JD0", 1, "ETH", {from: alice}) 
		await instance.createBounty("Job Description from Alice - JD1", 1, "ETH", {from: alice}) 
    	
    	// verify submit op b4 stopped contract
    	await instance.submitWork(0, "Submission for Alice JD0 by Bob", {from: bob})
    	//
    	const owner = await instance.owner()
    	await instance.stopContract({from: owner})    	
		// should error/revert when when we try to create a bounty after the contract is stopped
		await catchRevert(instance.createBounty("Job Description from Alice", 2, "ETH", {from: alice}))	
		// should error/revert when when we try to submit for a bounty after the contract is stopped 
		await catchRevert(instance.submitWork(1, "Submission for Alice JD1 by Bob", {from: bob}))  

		// test re-activation of contract  
		await instance.activateContract({from: owner}) 
		const submitSuccess2 = await instance.submitWork(1, "Submission for Alice JD1 by Bob", {from: bob})
		assert(submitSuccess2, 'Trx to submitWork failed after contract re-activation')
    })

})
