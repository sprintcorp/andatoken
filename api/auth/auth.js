var jwt = require('jsonwebtoken');

const auth ={
verifyToken :(req, res, next) => {
   
    if (req.headers.token) {
        jwt.verify(req.headers.token, 'coinintegration', (err, result) => {
            if (err )
            {
                res.send({response_code:500,response_message:"Internal server error", err})
            }
        else if( !result) {
                response(res, ErrorCode.INVALID_TOKEN, [], ErrorMessage.INCORRECT_JWT)
            }
            else {
                console.log("token verified")
              next();
              
            }
        })
    } else {
       res.send({response_code:400 , response_message:"Please provide token"})
    }

}
}
module.exports = auth



// Today's task 
// 1) ehereum get balance 
// 2) ethereum transfer funds
// 3) AES encryption and decryption




///origin2- git