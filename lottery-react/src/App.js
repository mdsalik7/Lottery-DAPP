import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import web3 from './web3'
import lottery from './lottery'

class App extends Component  {
  //creation and initiatonlization of state
  constructor(props){
    super(props)
    //manager state set with default empty string
    this.state = {manager : '', players : [], balance : '', value : '', message : ''}
  }

  /* ES6 Syntax
  state = {
    manager : ''  EQUIVALENT TO ABOVE CODE
  }
  */

  async componentDidMount(){
    //getting manager from contract
    const manager = await lottery.methods.manager().call()
    //getting players from contract
    const players = await lottery.methods.getPlayers().call()
    //getting balance from contract
    const balance = await web3.eth.getBalance(lottery.options.address)
    //setting state manager with manager, After setting the state render() method is called automatically
    this.setState({manager : manager, players : players, balance : balance})
  }

  onSubmit = async (event) => {
    event.preventDefault()
    const accounts = await web3.eth.getAccounts()
    this.setState({message : 'Hang On!! Waiting on transaction success..'})
    await lottery.methods.enter().send({
      from : accounts[0],
      value : web3.utils.toWei(this.state.value, 'ether')
    })
    this.setState({message : 'You have been entered..'})
  }

  onClick = async () => {
    const accounts = await web3.eth.getAccounts()
    this.setState({message : 'Hang On!! Picking a Winner..'})
    await lottery.methods.pickAWinner().send({
      from : accounts[0]
    })
    this.setState({message : 'Winner has been Picked..'})
  }

render() {
  return (
    <div>
      <h2>Lottery Contract</h2>
        <p>This Contract Is Managed By {this.state.manager}{/*calling the manager property inside state*/}.
        There are currently {this.state.players.length} people entered
        competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>
        <hr/>
        <form onSubmit={this.onSubmit}>
          <h4>Try Your Luck</h4>
          <div>
            <label>Amount of Ether to Enter </label>
            <input 
              value = {this.state.value}
              onChange={event => this.setState({value : event.target.value})}>
            </input>
          </div>
          <button>Enter</button>
        </form>
        <hr/>
          <h4>Pick a Winner</h4>
          <button onClick={this.onClick}>Pick</button>
        <hr/>
        <h2>{this.state.message}</h2>
    </div>
  );
}
}

export default App;
