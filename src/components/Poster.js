import React, { Component } from 'react';
import Web3 from 'web3';
//import { BN } from "web3-utils";
import './App.css';
import Bounty from '../abis/Bounty.json';

class Poster extends Component {

  constructor(props) {
    super(props)
    this.state = {
      currentPage: 'HOME',
      account: '',
      bountyCount: 0,
      bountyId: 0,
      bounties: [],
      submissions: [],
      loading: true,
      login: true,
      role: ''
    }

    // binds the function to components
    this.createBounty = this.createBounty.bind(this)
    this.listMyBounties = this.listMyBounties.bind(this)
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
    this.setState({ account: accounts[0] }) // i.e account connected via metamask
    const networkId = await web3.eth.net.getId()
    const networkData = Bounty.networks[networkId]

    if(networkData) {
      const bountyContract = web3.eth.Contract(Bounty.abi, networkData.address)
      this.setState({ bountyContract })
      //
      const bountyIdx = await bountyContract.methods.bountyIndex().call()
      this.setState({ bountyCount: bountyIdx })

      this.listMyBounties()  
    } 
    else {
      window.alert('Bounty contract not deployed to detected network.')
    }

  }

  async listMyBounties() {
    if( this.state.account === '') {
      window.alert("Info: please enter your EOA to begin")
      return
    } 
    else
      this.setState({ account: this.state.account })

    var myList = await this.state.bountyContract.methods.viewMyBounties().call({ from: this.state.account })
    var len = myList.length

    for (var i = 0; i < len; i++) {
      var bountyId = myList[i] 
      const bounty = await this.state.bountyContract.methods.bountyList(bountyId).call();
      this.setState({bounties: [...this.state.bounties, bounty]})
    }
      
    this.setState({ loading: false})
  }

  async createBounty(jd, payout) {
    if( this.state.account === '') {
      window.alert("Info: please enter your EOA to begin")
      return
    } 
    else
      this.setState({ account: this.state.account })

    await this.state.bountyContract.methods.createBounty(jd, payout, "ETH").send({ from: this.state.account })

    window.alert("Info: createBounty was called from address: "+this.state.account)

    this.setState({ loading: false })
  }

  async listSubmission(bountyid) {
    this.setState({submissions: []})
    var len = await this.state.bountyContract.methods.getNumberOfSubsForBounty(bountyid).call()
   
    var found = false
    for (var i=0; i<len; i++) { 
        found = true
        const workSubList = await this.state.bountyContract.methods.submissionList(bountyid, i).call()
        this.setState({submissions: [...this.state.submissions, workSubList]})           
    } 

    if(found)  
      this.setState({bountyId: bountyid})
    else {
      this.setState({submissions: []})
      window.alert("Info: there are no submissions available")
    }

    this.setState({ loading: false})  
  }

  async acceptWork(bountyid, submitter) {
    // guard against empty metamask account
    if( this.state.account === '') {
      window.alert("Info: please enter your EOA to begin")
      return
    } 
    else
      this.setState({ account: this.state.account })

    const workItem = await this.state.bountyContract.methods.bountyList(bountyid).call()
    const payout = workItem[3]    // from Bounty contract struct
    const accepted = workItem[7]  // from Bounty contract struct

    // work can only be accepted if there exist a payout for the bounty & if it is not already accepted
    if(payout > 0 && !accepted)
       await this.state.bountyContract.methods.acceptWork(bountyid, submitter).send({from: this.state.account, value: window.web3.utils.toWei(payout.toString(), 'ether')})    

    this.setState({ loading: false})
  }

  render() {
    return (
      <div id="content">
        <h3>Job/Bounty poster</h3><h4>Your connected account: <span id="account">{this.state.account}</span></h4>
        <form onSubmit={(event) => {
          event.preventDefault()
          
          const descrip = this.workDescrip.value
          const amount = this.bountyAmount.value
          this.createBounty(descrip, amount)
        }}>
          <div className="form-group mr-sm-2">
            Enter the work description for your bounty
            <input
              id="workDescrip"
              type="text"
              ref={(input) => { this.workDescrip = input }}
              className="form-control"
              placeholder="Work description"
              required />
          </div>
          Enter the bounty prize amount
          <div className="form-group mr-sm-2">
            <input
              id="bountyAmount"
              type="number"
              ref={(input) => { this.bountyAmount = input }}
              className="form-control"
              placeholder="Bounty Amount in ETH"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Add Bounty</button>      
        </form>
        <p>&nbsp;&nbsp;</p>

        <h3>List my bounties</h3> 
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Bounty Id</th>
              <th scope="col">Work description</th> 
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
                  <td>{bounty.payoutAmount.toString()}</td>
                  <td>
                    { !bounty.accepted
                      ? <button
                          value={bounty.bountyId}
                          onClick={(event) => {this.listSubmission(event.target.value)}} >
                            View submissions
                        </button>
                      : <span><strong>Bounty closed</strong></span>
                    }
                    </td>  
                </tr>                
              )
            })}
          </tbody>
          </table>
          <h3>List submissions</h3>
          <table className="table">
          <thead>
            <tr>
              <th scope="col">Work submission</th> 
              <th scope="col">Submitter</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody id="subList">
            { this.state.submissions.map((sub, key) => {
              return(
                <tr key={key}>
                  
                  <td>{sub[1]}</td> 
                  <td>{sub[0]}</td>
                  <td>
                    { 
                      <button
                          value={sub[0]}
                          onClick={(event) => {this.acceptWork(this.state.bountyId, event.target.value)}}>
                        Accept work
                      </button>
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
export default Poster;