var Web3 = require('web3');
var fs = require('fs');
var BigNumber = require('bignumber.js');
//let Tx = require('ethereumjs-tx');
const Tx = require('ethereumjs-tx').Transaction
const axios = require('axios');
var path = require("path");
const request = require('request');
const common = require('ethereumjs-common');


const PROVIDER_URL = "https://bsc-dataseed.binance.org"
const web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
// const CONTRACT_ADDRESS = "0xfbbbab59a7ea75bb59bcb7a98e8f020d6de821e9";
const CONTRACT_ADDRESS = "0xA9A13BA55224BFCDdd3cf67b73E2051e715fCC05";


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
  if (fees == 'low') {
    ret = prices.low
  }
  else if (fees == 'medium') {
    ret = prices.medium
  }
  else if (fees == 'high') {
    ret = prices.high
  }
  return ret;
}



module.exports = {
  get_transfer: (req, res) => {
    erc_transfer(req).then((resp) => {
      return res.send({ code: 200, msg: resp })
    }).catch((err) => {
      return res.send({ code: 400, msg: err })
    })
  },

  generate_address: (req, res) => {
    if (!req.body.password) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    else {
      var privateKey = web3.eth.accounts.wallet.create(1, req.body.password)
      var objInfo = privateKey.length - 1;
      var result = {
        address: privateKey[objInfo].address,
        privateKey: privateKey[objInfo].privateKey
      }
      return res.send({ code: 200, Result: result })
    }
  },

  get_balance: (req, res) => {
    var options = {

      url: `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${CONTRACT_ADDRESS}&address=${req.body.address}`

    };
    console.log(options);
    function callback(error, response, body) {


      var body_status = JSON.parse(body).status
      if (body_status == "0") {
        res.status(200).json({ status: 400, message: "Invalid address" });
      } else if (!error && response.statusCode == 200) {

        res.status(200).json({ status: 200, message: "Wallet_balance", result: JSON.parse(body).result / 1000000000000000000 });
      } else {

        res.send({ code: 500, error: "Internal server error" })
      }
    }
    request(options, callback);

  },

  transfer: async (req, res) => {
    var AdminAddress = '0x561c8CbB90efB8358750432EFE8461e5E88C6556';
    var AbiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, './tt3.json'), 'utf-8'));
    const { senderAddress, amount, privateKey } = req.body;
    var web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
    var transferAmount = web3.utils.toWei(amount.toString(), "ether");
    var nonce = await web3.eth.getTransactionCount(senderAddress);
    const contract = new web3.eth.Contract(AbiArray, CONTRACT_ADDRESS);
    const data = contract.methods.transfer(AdminAddress, transferAmount);
    let gasPrices = await getCurrentGasPrices();
    let dynamicGasPrice = await setDynamicPrice('medium', gasPrices);
    var rawTransaction = {
      nonce: web3.utils.toHex(nonce),
      gasPrice: web3.utils.toHex(dynamicGasPrice * 1e9),
      gasLimit: web3.utils.toHex(0x250CA),
      to: CONTRACT_ADDRESS,
      value: "0x0",
      data: data.encodeABI(),
      chainId: 56
    };
    var privKey = new Buffer.from(privateKey, "hex");
    const chain = common.default.forCustomChain(
      'mainnet', {
      name: 'bnb',
      networkId: 56,
      chainId: 56
    },
      'petersburg'
    )
    var tx = new Tx(rawTransaction, { common: chain });
    tx.sign(privKey);
    let serializedTx = "0x" + tx.serialize().toString("hex");
    web3.eth.sendSignedTransaction(serializedTx).on("transactionHash", async (txHash, err) => {
      if (!err) {
        res.status(200).json({ status: 200, message: "Transaction placed", data: txHash });
      } else {
        res.status(400).json({ error: err });
      }
    });
  },
}
