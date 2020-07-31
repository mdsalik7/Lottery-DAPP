const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const provider = ganache.provider();
const web3 = new Web3(provider);
const {interface, bytecode} = require('../compile')

let accounts;
let lottery;
beforeEach(async () => {
    //get list of all the accounts
    accounts = await web3.eth.getAccounts();

    //use one of the account to deploy the contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data : bytecode})
    .send({from : accounts[0], gas : '1000000'})
    lottery.setProvider(provider);
})

describe('Lottery', () => {
    it('deploys a contract', () => {
        //test if the contract is successfully deployed or not
        assert.ok(lottery.options.address)
    })
    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from : accounts[0],
            value : web3.utils.toWei('0.02', 'ether')
        })
        const players = await lottery.methods.getPlayers().call({
            from : accounts[0]
        })
        assert.equal(accounts[0], players[0])
        assert.equal(1, players.length)
    })
    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from : accounts[0],
            value : web3.utils.toWei('0.02', 'ether')
        })
        await lottery.methods.enter().send({
            from : accounts[1],
            value : web3.utils.toWei('0.02', 'ether')
        })
        await lottery.methods.enter().send({
            from : accounts[2],
            value : web3.utils.toWei('0.02', 'ether')
        })
        const players = await lottery.methods.getPlayers().call({
            from : accounts[0]
        })
        assert.equal(accounts[0], players[0])
        assert.equal(accounts[1], players[1])
        assert.equal(accounts[2], players[2])
        assert.equal(3, players.length)
    })
    it('requires minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from : accounts[0],
                value : 0
            })
            //if the above try block runs, that means enter() executed with 0 
            //wei, which is not right, so assert is made false to give the 
            //test result as fail
            assert(false)
        }
        //if try block didnt execute and returned a error so we catched that error
        catch(err) {
            //and checked if there is an error
            assert(err)
        }
    })
    it('only manager can pick a winner', async () => {
        try {
            await lottery.methods.pickAWinner().send({
                from : accounts[1]  //not the manager
            });
            assert(false);
        }
        catch(err){
            assert(err)
        }
    });
    it('sends money to the winner and reset the players array', async () => {
        const initialBalance = await web3.eth.getBalance(accounts[0])
        console.log('Initial Balance', initialBalance) //initial balance in act

        await lottery.methods.enter().send({
            from : accounts[0],
            value : web3.utils.toWei('2', 'ether')
        })

        const afterEnterBalance = await web3.eth.getBalance(accounts[0])
        console.log('afterEnterBalance', afterEnterBalance) //balance after gettin lottery

        await lottery.methods.pickAWinner().send({
            from : accounts[0]
        })

        const afterWin = await web3.eth.getBalance(accounts[0])
        console.log('afterWin', afterWin) //balance after win

        const difference = afterWin - afterEnterBalance
        console.log('difference', difference) ////how much i won
        assert(difference > web3.utils.toWei('1.8', 'ether'))

        const gasFee = initialBalance - afterWin
        console.log('gasFee', gasFee) //gas fee 

        const players = await lottery.methods.getPlayers().call({
            from : accounts[0]
        })
        assert.equal(0, players.length) //check players array reset to 0

    })
})