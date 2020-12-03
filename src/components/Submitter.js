import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Bounty from '../abis/Bounty.json';

class Submitter extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      bountyCount: 0,
      bounties: [],
      loading: true,
      login: true,
      role: ''
    }

    this.listAllBounties = this.listAllBounties.bind(this)
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Bounty.networks[networkId]

    if(networkData) {
      const bountyContract = web3.eth.Contract(Bounty.abi, networkData.address)
      this.setState({ bountyContract })
      //
      const bountyIdx = await bountyContract.methods.bountyIndex().call()
      this.setState({ bountyCount: bountyIdx })

      this.listAllBounties()  
    } 
    else {
      window.alert('Bounty contract not deployed to detected network.')
    }
  }

  async listAllBounties() {
    var len = await this.state.bountyContract.methods.bountyIndex().call();
    //window.alert('Info:: listAllBounties is called from compo with len: '+len)
    for (var i = 0; i < len; i++) {
      const bounty = await this.state.bountyContract.methods.bountyList(i).call();
      this.setState({bounties: [...this.state.bounties, bounty]})
    }  
    this.setState({ loading: false})
  }

  async submitWork(bountyid, workSub) { 
    if(this.state.account === '' || workSub === '' ) 
      window.alert("Warning: please enter your work submission")
    else
      await this.state.bountyContract.methods.submitWork(bountyid, workSub).send({from: this.state.account })
  }

  async myMyBalance() {
     if(this.state.account === '' ) 
      window.alert("Warning:  please enter your EOA address") 
    else {
      var amount = await this.state.bountyContract.methods.pendingPayOut(this.state.account).call();
      window.alert("Your payout balance is: "+amount+" ETH")
    } 
  }

  async withdrawMyBalance() {    
    if(this.state.account === '' ) 
      window.alert("Warning:  please enter your EOA address") 
    else {
      var amount = await this.state.bountyContract.methods.pendingPayOut(this.state.account).call();

      if (amount > 0 ) {
        await this.state.bountyContract.methods.withdrawMyPayout().send({from: this.state.account })
        window.alert("Your payout balance withdrawn is: "+amount+" ETH")
      }
      else
        window.alert("There are no balance to be withdrawn")   
    }  
  }


  render() {
    return (
      <div id="content">    
        <h3>Job/Bounty hunter</h3><h4>Your connected account: <span id="account">{this.state.account}</span></h4>        
        <div className="form-group ">
            
            Enter your work submission
            <input
              id="workSubmission"
              type="text"
              ref={(input) => {this.workSubmission = input}}
              className="form-control"
              placeholder="Work submission" required/>
            <p>&nbsp;</p>   
            <form onSubmit={(event) => {
              event.preventDefault()
              this.withdrawMyBalance()
            }}>  
              <button type="submit" className="btn btn-primary">Withdraw payment</button>
            </form>                    
        </div>
        <h4>Listing of all bounties</h4>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Bounty Id</th>
              <th scope="col">Work description</th> 
              <th scope="col">Job poster</th>
              <th scope="col">Bounty amount (ETH)</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody id="bountyList">
            { this.state.bounties.map((bounty, key) => {
              return(
                <tr key={key}>
                  <th scope="row">{bounty.bountyId.toString()}</th>
                  <td>{bounty.jobDescription}</td> 
                  <td>{bounty.poster}</td>
                  <td>{bounty.payoutAmount.toString()}</td>
                  <td>
                    { !bounty.accepted
                      ? <button
                          value={bounty.bountyId}
                          onClick={(event) => {if(bounty.poster===this.state.account){alert('You cannot submit work for your own bounty'); return false}; this.submitWork(event.target.value, this.workSubmission.value)}}
                        >
                          Submit work
                        </button>
                      : <span><strong>Bounty closed</strong></span>
                    }
                    </td>
                </tr>
              )
            })}
          </tbody>
        </table> 
           
      </div>
    );
  }
}
export default Submitter;