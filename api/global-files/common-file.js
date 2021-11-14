let BigNumber = require('bignumber.js');

module.exports = {
    responseHandler: (res, code, message, data) => {
        res.status(code).send({responseCode: code, responseMessage: message, data: data});
    },

    bigNumberOpera:(val1, val2, oprtr, precision)=>{
        let temp=0;
        val1=Number(val1);
        val2=Number(val2);
        if(!isNaN(val1)&&!isNaN(val2)){
            temp=new BigNumber(val1);
            if(oprtr==='+'){
                temp=temp.plus(val2).decimalPlaces(precision,1).toString() //this 1 signifies ROUND_DOWN 
                temp=Number(temp)
            }
            if(oprtr==='-'){
                temp=temp.minus(val2).decimalPlaces(precision,1).toString()
                temp=Number(temp)
            }
            if(oprtr==='*'){
                temp=temp.multipliedBy(val2).decimalPlaces(precision,1).toString()
                temp=Number(temp)
            }
            if(oprtr==='/'){
                temp=temp.dividedBy(val2).decimalPlaces(precision,1).toString()
                temp=Number(temp)
            }
            return temp;
        }
    }
};
