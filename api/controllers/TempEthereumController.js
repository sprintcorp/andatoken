const Web3 = require("web3");
const EthereumTx = require('ethereumjs-tx').Transaction;
const axios = require('axios');
// const ethNetwork = 'https://ropsten.infura.io/v3/e3c39335c0394f4b9c1fddba0cf355a7';
const ethNetwork = 'https://mainnet.infura.io/v3/e5368145789d48179ff2e499f05f7a8c'; 
const web3 = new Web3(new Web3.providers.HttpProvider(ethNetwork));
let resURL='';
 
async function getBalance(address) {
  return new Promise((resolve, reject) => {
      web3.eth.getBalance(address, async (err, result) => {
          if(err) {
              return reject(err);
          }
          resolve(web3.utils.fromWei(result, "ether"));
      });
  });
}

async function transferFund(sendersData, recieverData, amountToSend, fees) {
  return new Promise(async (resolve, reject) => {
      var nonce = await web3.eth.getTransactionCount(sendersData.address);
      web3.eth.getBalance(sendersData.address, async (err, result) => {
          if (err) {
              return reject();
          }
          let balance = web3.utils.fromWei(result, "ether");
          console.log(balance + " ETH");
          if(balance < amountToSend) {
              console.log('insufficient funds');
              return reject('insufficient funds');
          }
 
          let gasPrices = await getCurrentGasPrices();
          let dynamicGasPrice = await setDynamicPrice(fees, gasPrices);
          console.log('fees', fees);
          console.log("gasPrices",gasPrices);
          console.log('dynamicGasPrices', dynamicGasPrice);

          let details = {
              "to": recieverData.address,
              "value": web3.utils.toHex(web3.utils.toWei(amountToSend.toString(), 'ether')),
              "gas": 21000,
              "gasPrice": dynamicGasPrice * 1000000000,
              "nonce": nonce,
             // "chainId": 3 
          };
         
          const transaction = new EthereumTx(details, {chain: 'mainnet'});
          let privateKey = sendersData.privateKey.split('0x');
          console.log("sdfds", privateKey[0]);
          let privKey = Buffer.from(privateKey[0],'hex');
          transaction.sign(privKey);  
         
          const serializedTransaction = transaction.serialize();
         
          web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'), (err, id) => {
              if(err) {
                  console.log(err);
                  return reject();
              }
              const url = `https://etherscan.io/tx/${id}`;
              console.log(url);
              resolve({id: id, link: url});
          });
      });
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

    console.log("req.body======>>>", req.body)
    if (!req.body.privateKey || !req.body.fromAddr || !req.body.toAddr) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    let sendersData={address: req.body.fromAddr, privateKey: req.body.privateKey}
    let recieverData={address: req.body.toAddr}
    let amount = req.body.amount;
    let fees = req.body.fees;
     transferFund(sendersData, recieverData,amount, fees).then((resp)=>{
       if(resp){
        return res.send({ code: 200,msg:'success',hash:resp.link.split('/')[4]})
       }else{
        return res.send({ code: 400,msg:'Insufficient funds'})

       }
      
     }).catch((err)=>{
      return res.send({ code: 400,msg:err})
     })
  }
}
