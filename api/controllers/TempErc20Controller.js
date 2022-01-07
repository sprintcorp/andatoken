var Web3 = require('web3');
var fs = require('fs');
var BigNumber = require('bignumber.js');
//let Tx = require('ethereumjs-tx');
const Tx = require('ethereumjs-tx').Transaction
const axios = require('axios');
var path = require("path");

const PROVIDER_URL = "https://mainnet.infura.io/v3/e5368145789d48179ff2e499f05f7a8c"

async function erc_transfer(req) {
    return new Promise(async(resolve, reject) => {
        const { receiverAddress, fromAddress, contractAddress, privateKey, amount, fees } = req.body;
        var AbiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../global-files/tt3.json'), 'utf-8'));
        var web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
       // var transferAmount = web3.utils.toWei(amount.toString(), "ether");
        // console.log("Amount => ", transferAmount);
        var nonce = await web3.eth.getTransactionCount(fromAddress);
        const contract = new web3.eth.Contract(AbiArray, contractAddress);
       // console.log(contract,"dikha de")
        const decimal = await contract.methods.decimals().call()
        // console.log(decimal, "sdf")
        var transferAmount = String(amount*(10**decimal))
        const data = contract.methods.transfer(receiverAddress, transferAmount);
        let gasPrices = await getCurrentGasPrices();
        let dynamicGasPrice = await setDynamicPrice(fees, gasPrices);
        console.log('fees', fees);
        console.log("gasPrices",gasPrices);
        console.log('dynamicGasPrices', dynamicGasPrice);
            var rawTransaction = {
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(dynamicGasPrice * 1e9),
                gasLimit: web3.utils.toHex(0x250CA),
                to: contractAddress,
                value: "0x0",
                data: data.encodeABI(),
                chainId : 1,
                };
                var privKey = new Buffer.from(privateKey, "hex");
                var tx = new Tx(rawTransaction);// { chain: 'mainnet' });
                //console.log(tx,"///////////")
                tx.sign(privKey);
                let serializedTx = "0x" + tx.serialize().toString("hex");
                console.log(serializedTx);
             try{
                web3.eth
                .sendSignedTransaction(serializedTx)
                .on("transactionHash", async (txHash, err) => {
                    if (!err) {
                    console.log(txHash);
                    resolve (txHash)
                    } else {
                    console.log(err);
                    return reject(err.message)
                    }
                }).catch(function (e) {
                    console.log("####", e);
                    return reject(e.message)
                });
        } catch (error) {
            return reject(error.message)
        }
        
    });
}

  async function getCurrentGasPrices() {
    let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
    let prices = {
      low: response.data.safeLow / 10,
      medium: response.data.average / 10,
      high: response.data.fast / 10
    };
    return prices;
  }
  
    async function setDynamicPrice(fees, prices) {
        let ret;
        if(fees == 'low'){
        ret = prices.low
        }
        else if(fees == 'medium'){
        ret = prices.medium
        }
        else if(fees == 'high'){
        ret = prices.high
        }
        return ret;
    }
  
  module.exports = {
    get_transfer: (req, res) => {
        erc_transfer(req).then((resp)=>{
             return res.send({ code: 200,msg:resp})
        }).catch((err)=>{
           return res.send({ code: 400,msg:err})
        })
    }
}