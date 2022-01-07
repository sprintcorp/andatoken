const axios = require('axios');

const BASE_URL="https://api.cryptoapis.io"
//const NETWORK='testnet'
const NETWORK='mainnet'
const API_KEY="ba6a8d0986ee28b469ecbf012c23b0fa5b978b30"
const HEADERS = {
    'Content-Type': 'application/json',
    "X-API-Key": API_KEY
}

const getAddress=async()=>{
    return new Promise(async (resolve, reject) => {  
        axios.post(`${BASE_URL}/v1/bc/btc/${NETWORK}/address`, {},{headers:HEADERS}).then((response) => {
            resolve(response.data.payload)
        }).catch((error) => {
            console.error("ERROR",error.message)
            return reject(error.message)
        })
    })
}


const prepareTransaction= async(params)=>{
    let req = JSON.stringify({
        inputs: [{address: params.fromAddress,value: Number(params.amount)}],
        outputs:[{address: params.toAddress,value: Number(params.amount)}],
        fee: { value: 0.00023141 } }
    )
    return new Promise(async (resolve, reject) => {  
        axios.post(`${BASE_URL}/v1/bc/btc/${NETWORK}/txs/create`, req,{headers:HEADERS}).then((response) => {
            resolve(response.data.payload.hex)
        }).catch((error) => {
            console.error("ERROR",error.message)
            return reject(error.message)
        })
    })
}

const signTransaction = async(hex,params)=>{
    let req = JSON.stringify({ 
        hex: hex,
        wifs: [ params.wifs ]
    })
    return new Promise(async (resolve, reject) => {  
        axios.post(`${BASE_URL}/v1/bc/btc/${NETWORK}/txs/sign`, req,{headers:HEADERS}).then((response) => {
            resolve(response.data.payload.hex)
        }).catch((error) => {
            console.error("ERROR",error.message)
            return reject(error.message)
        })
    })
}

const broadcastSignedTransaction = async(hex)=>{
    let req = JSON.stringify({ 
        hex: hex 
    })
    return new Promise(async (resolve, reject) => {  
        axios.post(`${BASE_URL}/v1/bc/btc/${NETWORK}/txs/send`, req,{headers:HEADERS}).then((response) => {
            resolve(response.data.payload.txid)
        }).catch((error) => {
            console.error("ERROR",error.message)
            return reject(error.message)
        })
    })
}

module.exports = {

    generate_address: (req, res) => {
        getAddress().then((resp)=>{
            console.log("OKK",resp)
            return res.send({ code: 200,msg:'success',data:resp})
        }).catch((err)=>{
            console.log(err)
            return res.send({ code: 400,msg:err})
        })
    },

    get_transfer: (req, res) => {
        prepareTransaction(req.body).then((p_hex)=>{
            console.log("Prepare Transaction",p_hex)
            signTransaction(p_hex, req.body).then((s_hex)=>{
                console.log("Signed Transaction", s_hex)
                broadcastSignedTransaction(s_hex).then((resp)=>{
                    console.log("Broadcast Transaction",resp)
                    return res.send({ code: 200,msg:'success',txid:resp})
                }).catch((err)=>{
                    console.log(err)
                    return res.send({ code: 400,msg:err})
                })
            }).catch((err)=>{
                console.log(err)
                return res.send({ code: 400,msg:err})
            })
        }).catch((err)=>{
            console.log(err)
            return res.send({ code: 400,msg:err})
        })
        
    }
}
