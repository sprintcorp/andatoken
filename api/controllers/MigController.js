const bip39 = require('bip39');
const bip32 = require('bip32');
const axios = require("axios");
const bitcoin = require("bitcoinjs-lib");
const net = require("net");
const apiHost = "https://api.blockchain.info/haskoin-store/";
const FEE_PRICE = 2
const MAX_INPUT = 500
const API_PORT = 3004
const express = require("express");
const bodyParser = require('body-parser');

function getPrefix(isMain) {
    return isMain ? "btc" : "btc-testnet";
}

function getBlockChainUrl(isMain) {
    let prefix = getPrefix(isMain);
    return apiHost + prefix
}

function log(message) {
    // logger.log(message);
    console.log(message);
}

function getXpub(root) {
    let node = root.derivePath("m/0'");
    return node.neutered().toBase58();
}

function generateAddress(root, account, index, network, bip) {
    let pathPrefix = "";
    if (network === bitcoin.networks.testnet) {
        switch (bip) {
            case "BIP_32":
                pathPrefix = "m/0'/";
                break;
            case "BIP_44":
                pathPrefix = "m/44'/1'/0'/";
                break;
            case "BIP_49":
                pathPrefix = "m/49'/1'/0'/";
                break;
            case "BIP_84":
                pathPrefix = "m/84'/1'/0'/";
                break;
        }
    } else {
        switch (bip) {
            case "BIP_32":
                pathPrefix = "m/0'/";
                break;
            case "BIP_44":
                pathPrefix = "m/44'/0'/0'/";
                break;
            case "BIP_49":
                pathPrefix = "m/49'/0'/0'/";
                break;
            case "BIP_84":
                pathPrefix = "m/84'/0'/0'/";
                break;
        }
    }
    let path = `${pathPrefix}${account}/` + index;
    let node = root.derivePath(path);
    switch (bip) {
        case "BIP_32":
            return getLegacyAddress(node, network);
        case "BIP_44":
            return getLegacyAddress(node, network);
        case "BIP_49":
            return getSegWitAddressViaP2SH(node, network);
        case "BIP_84":
            return getSegWitAddress(node, network);
    }
}

function getLegacyAddress(keyPair, network) {
    let address = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network}).address
    let signKey = keyPair.toWIF();
    return {
        address,
        signKey
    }
}

function getSegWitAddress(keyPair, network) {
    const p2wpkh = bitcoin.payments.p2wpkh({pubkey: keyPair.publicKey, network});
    let address = p2wpkh.address;
    let signKey = keyPair.toWIF();
    return {
        address,
        signKey
    }
}

function getSegWitAddressViaP2SH(keyPair, network) {
    const p2shObj = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({pubkey: keyPair.publicKey, network})
    });
    let address = p2shObj.address;
    let signKey = keyPair.toWIF();
    return {
        address,
        signKey
    }
}

// https://api.blockchain.info/haskoin-store/btc-testnet/xpub/tpubD9MANc4FGWispvgKgvvi3mqg2ASm8JJ9aTGoTm6GSp1SeYXqfGb5kP2tJN3fi3Y54isW9Nc1PfN37jAmcN7V8GpEmbg8tEKFbU2EkQp4J3n/balances
// function checkXpubHistory(xpub, mainnet) {
//     return axios.get(getBlockChainUrl(mainnet) + '/multiaddr?active=' + xpub).then((response) => {
//         let balance = response.data['addresses'][0]['final_balance'];
//         log(balance);
//         if (balance > 0) {
//             log('SUCCESS');
//         } else {
//             log('zero');
//         }
//     });
// }

// /blockchain/multiaddr?active=xpub6AUayFz1x6NUtZKGnLEpX1Q9BLp2hHkP1FKbZLwdpsgeEH2ar3jxepEtqnjQgyLvv5FHaZc4aytxBhxGjEZHDyfPhzGwduSVpBWWpPJS87X
// /xpub/tpubD9MANc4FGWispvgKgvvi3mqg2ASm8JJ9aTGoTm6GSp1SeYXqfGb5kP2tJN3fi3Y54isW9Nc1PfN37jAmcN7V8GpEmbg8tEKFbU2EkQp4J3n/balances
function checkXpubBalance(extendedPublicKey, isMain) {
    return new Promise((resolve, reject) => {
        axios.get(getBlockChainUrl(isMain) + `/blockchain/multiaddr?active=${extendedPublicKey}`).then((response) => {
            // log(response.data);
            let balance = response.data['addresses'][0]['final_balance'];
            resolve(balance)

        }).catch(error => {
            reject(error)
        });
    })
}

// /xpub/tpubD9MANc4FGWispvgKgvvi3mqg2ASm8JJ9aTGoTm6GSp1SeYXqfGb5kP2tJN3fi3Y54isW9Nc1PfN37jAmcN7V8GpEmbg8tEKFbU2EkQp4J3n/balances
function checkXpubUnspent(extendedPublicKey, isMain) {
    return new Promise((resolve, reject) => {
        axios.get(getBlockChainUrl(isMain) + `/xpub/${extendedPublicKey}/unspent`).then((response) => {
            resolve(response.data)
        }).catch(error => {
            reject(error)
        });
    })
}

function processGetRaw(unspentOutputs, isMain, start = 0) {
    let space = 50;
    let txIds = [];
    let data = unspentOutputs.slice(start, start + space);
    data.forEach(item => {
        let txo = item['unspent'];
        txIds.push(txo["txid"])
    });

    if (data.length === 0) {
        return
    }

    return new Promise((resolve, reject) => {
        let rawTxs = []
        getRawTxs(txIds, isMain).then((data) => {
            rawTxs = rawTxs.concat(data);
            let nextIndex = start + space;
            if (nextIndex >= unspentOutputs.length || nextIndex >= MAX_INPUT) {
                resolve(rawTxs)
            } else {
                processGetRaw(unspentOutputs, isMain, nextIndex).then((data) => {
                    rawTxs = rawTxs.concat(data);
                    resolve(rawTxs)
                }).catch(error => {
                    reject(error)
                });
            }
        }).catch(error => {
            reject(error)
        });
    });
}

function getRawTxs(txIds, isMain) {
    return new Promise((resolve, reject) => {
        axios.get(getBlockChainUrl(isMain) + `/transactions/raw?txids=${txIds.join()}`).then((response) => {
            resolve(response.data)
        }).catch(error => {
            reject(error)
        });
    });
}


function getFeeAmount(number) {
    // 250 tx => 100 (Around 2.5 sat/B)
    return (number * FEE_PRICE) * 1000
}

function createTx(network, unspentOutputs, rawTxs, toWallet, root) {

    const psbt = new bitcoin.Psbt({network: network});

    let amount = 0;
    let buffer = 0;
    let maxInput = MAX_INPUT;
    if (maxInput > unspentOutputs.length) {
        maxInput = unspentOutputs.length;
    }
    console.log("Number unspentOutputs: " + maxInput);
    // Blockchain.info
    for (let i = buffer; i < maxInput; i++) {
        let txo = unspentOutputs[i]['unspent'];
        let path = unspentOutputs[i]['path'];
        amount += txo['value'];

        psbt.addInput({
            hash: txo['txid'],
            index: txo['index'],
            nonWitnessUtxo: Buffer.from(rawTxs[i], 'hex')
        });
    }

    let inputAmount = 0
    let fee = getFeeAmount(maxInput);

    inputAmount = amount - fee;


    console.log("Fee: " + fee / 10 ** 8);
    console.log("Send amount: " + inputAmount / 10 ** 8);

    psbt.addOutput({
        address: toWallet,
        value: inputAmount,
    });

    for (let i = buffer; i < maxInput; i++) {
        let txo = unspentOutputs[i]['unspent'];
        let path = unspentOutputs[i]['path'];
        let {address, signKey} = generateAddress(root, path[0], path[1], network, "BIP_32")
        if (address === txo['address']) {
            psbt.signInput(i, bitcoin.ECPair.fromWIF(signKey, network))
        }
    }

    psbt.finalizeAllInputs();

    let txRaw = psbt.extractTransaction().toHex();
    let weight = psbt.extractTransaction().weight();
    let txId = psbt.extractTransaction().getId();
    let size = psbt.extractTransaction().byteLength();
    console.log("Hash: " + txId);
    console.log("Weight: " + weight);
    console.log("Total size of this transaction: " + size);
    console.log("Fee per byte: " + (fee / size) + " sat/B");
    console.log("Fee per weight unit: " + (fee / weight) + " sat/WU");

    console.log(txRaw);
    return new Promise((resolve, reject) => {
        submitTx(txRaw, network === bitcoin.networks.bitcoin).then(() => {
            resolve()
        }).catch(error => {
            console.error(error)
            resolve()
        });
    })
}

function submitTx(rawTx, isMain) {
    return new Promise((resolve, reject) => {
        axios.post(getBlockChainUrl(isMain) + '/transactions', rawTx).then((response) => {
            log("Submit transaction");
            log(rawTx);
            log(response.data);
            resolve()
        }).catch(error => {
            console.error(error)
            resolve()
        });
    })
}

function main() {
    let isMain = false
    let network = isMain ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    let mnemonic = ""
    let seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
    let root = bip32.fromSeed(seedBuffer, network);

    let {address, signKey} = generateAddress(root, 0, 0, network, "BIP_49")
    log(address);

    let extendedPublicKey = getXpub(root, isMain)
    log(extendedPublicKey);
    checkXpubBalance(extendedPublicKey, isMain).then(balance => {
        log(balance)
        // 0.00001 BTC
        if (balance > 1000) {
            checkXpubUnspent(extendedPublicKey, isMain).then(unspent => {
                processGetRaw(unspent, isMain, 0).then(rawTxs => {
                    createTx(network, unspent, rawTxs, address, root).then(() => {

                    })
                }).catch(error => {
                    console.error(error)
                })
            }).catch(error => {
                console.error(error)
            })
        }
    })
}

function walletSummary(req, res, next) {
    let data = req.body;
    const mnemonic = data["mnemonic"];
    let networkS = data["network"];
    // let bip = data["bip"]; // BIP_49

    let isMain = networkS === "mainnet"
    let network = isMain ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

    let seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
    let root = bip32.fromSeed(seedBuffer, network);

    let genAdd32 = generateAddress(root, 0, 0, network, "BIP_32")
    let genAdd49 = generateAddress(root, 0, 0, network, "BIP_49")
    let genAdd84 = generateAddress(root, 0, 0, network, "BIP_84")

    let extendedPublicKey = getXpub(root, isMain)
    checkXpubBalance(extendedPublicKey, isMain).then(balance => {
        res.json({
            xpub: extendedPublicKey,
            bip_32: genAdd32.address,
            bip_49: genAdd49.address,
            bip_84: genAdd84.address,
            balance
        })
    }).catch(error => {
        res.json({
            error: error
        })
    })
}

function migrateWallet(req, res) {
    let data = req.body;
    const mnemonic = data["mnemonic"];
    let networkS = data["network"];
    let bip = data["bip"]; // BIP_49

    let isMain = networkS === "mainnet"
    let network = isMain ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

    let seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
    let root = bip32.fromSeed(seedBuffer, network);

    let genAdd = generateAddress(root, 0, 0, network, bip)

    let extendedPublicKey = getXpub(root, isMain)
    log(extendedPublicKey);
    checkXpubBalance(extendedPublicKey, isMain).then(balance => {
        log(balance)
        // 0.00001 BTC
        if (balance > 1000) {
            checkXpubUnspent(extendedPublicKey, isMain).then(unspent => {
                processGetRaw(unspent, isMain, 0).then(rawTxs => {
                    createTx(network, unspent, rawTxs, genAdd.address, root).then(() => {
                        res.json({
                            success: true
                        })
                    })
                }).catch(error => {
                    console.error(error)
                    res.json({
                        error: error
                    })
                })
            }).catch(error => {
                console.error(error)
                res.json({
                    error: error
                })
            })
        } else {
            console.error("Balance < 1000")
            res.json({
                error: "Balance < 1000"
            })
        }
    }).catch(error => {
        console.error(error)
        res.json({
            error: error
        })
    })
}

module.exports = {
    migrate_wallet: (req, res) => {
        return migrateWallet(req,res)
    },
    wallet_summary: (req, res) => {
        return walletSummary(req,res)
    }
}



