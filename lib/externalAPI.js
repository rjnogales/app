/*
 * Library for handling iexcloud API requests
 *
 */

const http = require('https');
const token = 'pk_bdbdfc4f51694230b2af64803a6779dc';
const host = 'cloud.iexapis.com';
externalAPI = {};


externalAPI.getSymbolInfo = async function getSymbolInfo(symbol) {
  let quotePath = `/stable/stock/${symbol}/quote?token=${token}`;
  let logoPath = `/stable/stock/${symbol}/logo?token=${token}`;
  let quoteOptions = {
    host: host,
    path: quotePath,
  };

  let logOptions = {
    host: host,
    path: logoPath,
  };

  let quotePromise = new Promise(function (resolve, reject) {
    let callback = responseCallback;
    let req = http.request(quoteOptions, function (response) {
      callback(response, resolve)
    });
    req.on('error', function (error) {
      console.log('Got an error', error);
      reject(error);
    });
    req.end();
  });

  let logoPromise = new Promise(function (resolve, reject) {
    let callback = responseCallback;
    let req = http.request(logOptions, function (response) {
      callback(response, resolve)
    });
    req.on('error', function (error) {
      console.log('Got an error', error);
      reject(error);
    });
    req.end();
  });

  let quoteResult = await quotePromise;
  let logoResult = await logoPromise;
  
  let result = {
    companyName: quoteResult.companyName,
    price: quoteResult.iexRealtimePrice,
    change: quoteResult.change,
    logoURL: logoResult.url
  }

  return result;
}

function responseCallback (response, resolve) {
  let str = '';

  //another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  response.on('end', function () {
    let data = JSON.parse(str);
    console.log(data);
    resolve(data);
  });
};

module.exports = externalAPI;