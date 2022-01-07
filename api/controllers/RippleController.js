const commonFile = require('../global-files/common-file.js')
const RippleAPI = require('ripple-lib').RippleAPI
const FEE="0.000012"
const api = new RippleAPI({
   //  server:	'wss://s.altnet.rippletest.net:51233'
     server:	'wss://s2.ripple.com/'
 });

 submitTxn = (signedTransactionTemp, cb) => {
    let sub
    const signedTransaction = signedTransactionTemp;
    api.connect().then(() => {
        return api.submit(signedTransaction)
    }).then((submit) => {
        console.log("submit response==========>>>>>", submit)
        sub = submit;
    }).then(() => {
        return api.disconnect();
    }).then(() => {
        console.log('done and disconnected sT.');
        return cb(sub)
    }).catch(error => { console.log(error); return cb(null) });
},

signPayment = (txJSONTemp, secret, cb) => {
    let sig;
    const txJSON = txJSONTemp;
    api.connect().then(() => {
        return api.sign(txJSON, secret)
    }).then((sign) => {
        console.log("payment signed=======>>>>>>", sign)
        sig = sign
    }).then(() => {
        return api.disconnect();
    }).then(() => {
        console.log('done and disconnected sP.');
        return cb(sig)
    }).catch(error => { console.log(error); return cb(null) });
},

prepAndSignTxn = (sourceAddr, destAddr, destTag, withdrawAmt, secret, cb) => {       
    preparePaymentFn(sourceAddr, destAddr, destTag, withdrawAmt, (preparedPayment) => {
        console.log("@@@@@@@@payment prepared", preparedPayment)
        if (preparedPayment) {
            signPayment(preparedPayment.txJSON, secret, (signedPayment) => {
                console.log("#######signed payment====>>>>", signedPayment)
                if (signedPayment) {
                    return cb(signedPayment)
                } else {
                    return cb(false)
                    
                }
            })
        } else {
            return cb(false)
            
        }
    })
},

getSeqNo = (srcAddr, cb) => {
    let rspns, balance;
    api.connect().then(() => {
        const myAddress = srcAddr
        return api.getAccountInfo(myAddress);
    }).then(info => {
        temp = info
        console.log(info);
        rspns = info.sequence;
        balance = Number(info.xrpBalance);
        // return cb(info.sequence)
    }).then(() => {
        return api.disconnect();
    }).then(() => {
        console.log('done and disconnected gSNo.');
        return cb(rspns, balance)
    }).catch((error) => { console.log(error); return cb(null) });
},

preparePaymentFn = (sourceAddr, destAddr, destTag, withdrawAmt, cb ) => {
    console.log("lkljklhn", destTag)
    let prep
    // api.connect().then(() => {   
    const address = sourceAddr;
    console.log(sourceAddr, "dhgfjhgkj")
    console.log(destAddr,"cnmbn")
    if (address === destAddr) {
        return cb(null)
    }

    const payment = {
        "source": {
            "address": address,
            "maxAmount": {
                "value": String(withdrawAmt),
                "currency": "XRP"
            }
        },
        "destination": {
            "address": destAddr,
            "amount": {
                "value": String(withdrawAmt),
                "currency": "XRP"
            },
            "tag": Number(destTag)
        }
    };


    getSeqNo(sourceAddr, (seqNo, balInAddr) => {
        console.log("1111", seqNo)
        if (seqNo) {
            console.log("22",commonFile.bigNumberOpera(Number(balInAddr), Number(withdrawAmt), '-', 6))
            if(commonFile.bigNumberOpera(Number(balInAddr), Number(withdrawAmt), '-', 6) >= 0){
                console.log("true val")
                api.connect().then(() => {
                    console.log("check payment===>>>", payment)
                    const instructions = { fee:FEE, sequence: seqNo, maxLedgerVersionOffset: 5000 };
                    console.log(instructions)
                    return api.preparePayment(address, payment, instructions).then(prepared => {
                        console.log("test prepared", prepared)
                        prep = prepared
                     
// return cb(prepared)

                    })
                }).then(() => {
                    return api.disconnect();
                }).then(() => {
                    console.log('done and disconnected pPFn.');
                    return cb(prep)
                }).catch((error) => { console.log(error); return cb(null) });
            }else{
                return cb(null);
            }
        } else {
            return cb(null)
        }
    })
},

 module.exports = {

   "generate_new_addr": (req, res) => {
        let addr = {}
        api.connect().then(() => {
            return api.generateAddress();
        }).then((newAddr) => {
            console.log("=======>>", newAddr)
            addr = newAddr;
        }).then(() => {
            return api.disconnect();
        }).then(() => {
            console.log('done and disconnected.');
            return commonFile.responseHandler(res, 200, "Address generated successfully.", addr)
        }).catch((err) => {
            return commonFile.responseHandler(res, 500, "Internal server error.")
        });
    },



    "get_addr_info": (req, res) => {
        if (!req.body.addr) {
            return commonFile.responseHandler(res, 400, "Parameters missing.")
        } 
        console.log(req.body)
        temp = {};
        api.connect().then(() => {
            const myAddress = req.body.addr;
            console.log('getting account info for', myAddress);
            return api.getAccountInfo(myAddress);
        }).then(info => {
            temp = info
            console.log(temp)
        }).then(() => {
            return api.disconnect();
        }).then(() => {
            console.log('done and disconnected.');
            return commonFile.responseHandler(res, 200, "Info Found Successfully", temp)
        }).catch((err) => {
            return commonFile.responseHandler(res, 500, "Internal server error.")
        });
    },

    "payment_method": (req, res) => {
        let hash='';
        prepAndSignTxn(req.body.srcAddr, req.body.destAddr, req.body.toTag, req.body.amount, req.body.secret, (signedTxn) => {
            if (signedTxn) {
                submitTxn(signedTxn.signedTransaction, (submittedTxn) => {
                    if (submittedTxn.resultCode === "tesSUCCESS") {
                        hash = signedTxn.id;
                        return commonFile.responseHandler(res, 200, "XRP ledger processed the txn successfully.", hash)
                    } else {
                        return commonFile.responseHandler(res, 500, "XRP ledger could not submit the txn.")
                    }
                })
            } else {
                return commonFile.responseHandler(res, 500, "XRP ledger could not prepare the txn.")
            }
        })
    },
}
