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

// App
handlers.app = function(data, callback) {
  _data.read('../lib', 'app.html', function(err, data) {
    if(err) callback(err);
    else {
      console.log('read data', data);
      callback(200, data);
    }
  });
}

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

// stocks - POST
// POST:localhost:3000/stocks : add the symbol to the monitoring list, it is in the body the symbol to add.
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

// stocks - GET
/*
GET:localhost:3000/stocks/<symbol>        : Brings a single symbol to the monitoring list. EG: localhost:3000/stock/AAPL
GET:localhost:3000/stocks/<symbol>?update : Brings a single symbol to the monitoring list but updating the value using iexcloud. EG: localhost:3000/stock/AAPL?update
GET:localhost:3000/stocks                 : Brings all the symbols from the monitoring list. EG: localhost:3000/stock
GET:localhost:3000/stocks?update          : Brings all the symbols from the monitoring list. EG: localhost:3000/stock?update
*/
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

// stocks - DELETE
// DELETE:localhost:3000/stocks/<symbol> : Deletes the symbol to the monitoring list. EG:localhost:3000/stock/AAPL
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
