var Web3 = require('web3');
var fs = require('fs');
const Tx = require('ethereumjs-tx').Transaction
var path = require("path");
const PROVIDER_URL = "https://ropsten.infura.io/v3/46bec8b8af6948049280bc6737cc10d2"
async function erc_transfer(req) {
    return new Promise(async(resolve, reject) => {
        const { receiverAddress, fromAddress, contractAddress, privateKey, tokenId } = req.body;
        var AbiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../global-files/nft.json'), 'utf-8'));
        var web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
        var nonce = await web3.eth.getTransactionCount(fromAddress);
        const contract = new web3.eth.Contract(AbiArray, contractAddress);
        const data = contract.methods.safeTransferFrom(fromAddress, receiverAddress, tokenId);
            var rawTransaction = {
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(52 * 1e9),
                gasLimit: web3.utils.toHex(0x250CA),
                to: contractAddress,
                value: "0x0",
                data: data.encodeABI(),
                chainId : 3, //1
                };
                var privKey = new Buffer.from(privateKey, "hex");
                var tx = new Tx(rawTransaction, { chain: "ropsten" });//, { chain: 'mainnet' });
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

  module.exports = {
    get_transfer: (req, res) => {
        erc_transfer(req).then((resp)=>{
             return res.send({ code: 200,msg:"success",hash:resp})
        }).catch((err)=>{
           return res.send({ code: 400,msg:err})
        })
    }
}