var Web3 = require('web3');
var fs = require('fs');
const Tx = require('ethereumjs-tx').Transaction
var path = require("path");
const axios = require('axios');

//const PROVIDER_URL = "https://ropsten.infura.io/v3/46bec8b8af6948049280bc6737cc10d2"
const PROVIDER_URL = "https://mainnet.infura.io/v3/e5368145789d48179ff2e499f05f7a8c"
async function erc_transfer(req) {
    return new Promise(async(resolve, reject) => {
        const { receiverAddress, fromAddress, contractAddress, privateKey, tokenId, fees } = req.body;
        var AbiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../global-files/nft.json'), 'utf-8'));
        var web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
        var nonce = await web3.eth.getTransactionCount(fromAddress);
        const contract = new web3.eth.Contract(AbiArray, contractAddress);
        const data = contract.methods.safeTransferFrom(fromAddress, receiverAddress, tokenId);
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
                chainId : 1, //3
                };
                var privKey = new Buffer.from(privateKey, "hex");
               // var tx = new Tx(rawTransaction, { chain: "ropsten" });//, { chain: 'mainnet' });
                var tx = new Tx(rawTransaction);
                tx.sign(privKey);
                let serializedTx = "0x" + tx.serialize().toString("hex");
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
             return res.send({ code: 200,msg:"success",hash:resp})
        }).catch((err)=>{
           return res.send({ code: 400,msg:err})
        })
    }
}
