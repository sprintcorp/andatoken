
'use strict';


module.exports = function(app) {
  var ethereum = require('../controllers/EthereumController');
  var erc = require('../controllers/Erc20Controller');
  var  tron = require('../controllers/TronController');
  var  steller = require('../controllers/StellerController');
  var  ripple = require('../controllers/RippleController');
  var  eos = require('../controllers/EosController')
   var  btc = require('../controllers/BtcController')
   var  bch = require('../controllers/BchController')
   var  ltc = require('../controllers/LtcController')
  var  stake = require('../controllers/StakesController')
  var  ada = require('../controllers/AdaController')
  var nft = require('../controllers/Erc721Controller');
  var mig = require('../controllers/MigController')
  

    app.route('/eth/transfer')
    .post(ethereum.get_transfer);

    app.route('/erc/transfer')
    .post(erc.get_transfer);

    app.route('/nft/transfer')
    .post(nft.get_transfer);

    app.route('/mig/migrate-wallet')
    .post(mig.migrate_wallet);

    app.route('/mig/wallet-summary')
    .post(mig.wallet_summary);

    app.route('/tron/transfer')
    .post(tron.get_transfer);

    app.route('/ripple/transfer')
    .post(ripple.payment_method); 

    app.route('/ripple/generateAddress')
    .get(ripple.generate_new_addr);
    
    app.route('/eos/transfer')
    .post(eos.get_transfer)

    app.route('/steller/transfer')
    .post(steller.send_stellar)

    app.route('/steller/generateAddress')
    .post(steller.wallet)

    app.route('/btc/transfer')
    .post(btc.get_transfer);

    app.route('/btc/generateAddress')
    .get(btc.generate_address);

    app.route('/bch/transfer')
    .post(bch.get_transfer);

    app.route('/bch/generateAddress')
    .get(bch.generate_address);

    app.route('/ltc/transfer')
    .post(ltc.get_transfer);

    app.route('/ltc/generateAddress')
    .get(ltc.generate_address);

    app.route('/stake/ada')
    .post(stake.ada_stake);

    app.route('/stake/ada-claim')
    .post(stake.ada_claim);

    app.route('/stake/xtz')
    .post(stake.xtz_stake);

    app.route('/ada/generateAddress')
    .post(ada.wallet)

    app.route('/ada/transfer')
    .post(ada.transfer);


};
