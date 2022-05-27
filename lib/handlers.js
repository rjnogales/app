/*
 * Request Handlers
 *
 */

// Dependencies
let _data = require('./files');

// Define all the handlers
let handlers = {};

// Ping
handlers.ping = function(data,callback){
    callback(200);
};

// Not-Found
handlers.notFound = function(data,callback){
  callback(404);
};

// stocks
handlers.stocks = function(data,callback){
  console.log('Got request for stocks handler', data);
  let acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._stocks[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the stocks methods
handlers._stocks  = {};

// stocks - post
// Required data: symbol
// POST:localhost:3000/stock : add the symbol to the monitoring list, it is in the body the symbol to add.
handlers._stocks.post = function(data,callback){
  // Check that all required fields are filled out
  let symbol = typeof(data.payload.symbol) == 'string' && data.payload.symbol.trim().length > 0 ? data.payload.symbol.trim() : false;
  if(symbol){
    symbol = symbol.toLowerCase();
    data.db.addStock(symbol)
    .then(function (symbolObject) {
      callback(200, symbolObject);
    });
  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }

};

// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Dont let them access anyone elses.
handlers._stocks.get = function(data,callback){
  let pathSegments = data.parsedUrl.pathname.split('/');
  let symbol = pathSegments.length > 2 ? pathSegments.pop() : undefined;
  let updateSymbol = data.parsedUrl.query['update'] === 'true';

  console.log(`Got GET request with symbol ${symbol} and update ${updateSymbol}`);
  
  if(symbol) {
    symbol = symbol.toLowerCase();
    if(updateSymbol) {
      data.db.updateStock(symbol)
      .then(function (updatedStock) {
        callback(200, updatedStock);
      })
    } else {
      callback(200, data.db.getStock(symbol));
    }
  } else {
    if(updateSymbol) {
      data.db.updateAllStocks()
      .then(function (updatedStocks) {
        callback(200, updatedStocks);
      })
    } else {
      callback(200, data.db.getAllStocks(symbol)); 
    }
  }
};

// Required data: phone
// @TODO Only let an authenticated user delete their object. Dont let them delete update elses.
// @TODO Cleanup (delete) any other data files associated with the user
handlers._stocks.delete = function(data,callback){
  let pathSegments = data.parsedUrl.pathname.split('/');
  let symbol = pathSegments.length > 2 ? pathSegments.pop() : undefined;
  if(symbol) {
    data.db.removeStock(symbol)
    .then(function() {
      callback(200, {'result' : `Symbol ${symbol} has been removed.`});
    })
  } else {
    callback(400, {'Error' : 'Missing symbol to delete'});
  }
};



// Export the handlers
module.exports = handlers;
