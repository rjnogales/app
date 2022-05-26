/*
 * Request Handlers
 *
 */

// Dependencies
let _data = require('./data');

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

      // Create the symbol object
    let userObject = {
            'symbol' : symbol
          };

    _data.read('stocks','dataSymbol',function(err,data){
      if(err){
          // Store the symbol
          _data.create('stocks','dataSymbol',userObject,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not create file'});
            }
          });
      } else {
        _data.add('stocks','dataSymbol',userObject,function(err,data){
          if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not add data'});
            }
        });       
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }

};

// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Dont let them access anyone elses.
handlers._stocks.get = function(data,callback){
  // Check that phone number is valid
  let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // Lookup the user
    _data.read('stocks',phone,function(err,data){
      if(!err && data){
        // Remove the hashed password from the user user object before returning it to the requester
        delete data.hashedPassword;
        callback(200,data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user up their object. Dont let them access update elses.
handlers._stocks.put = function(data,callback){
  // Check for required field
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // Check for optional fields
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if phone is invalid
  if(phone){
    // Error if nothing is sent to update
    if(firstName || lastName || password){
      // Lookup the user
      _data.read('stocks',phone,function(err,userData){
        if(!err && userData){
          // Update the fields if necessary
          if(firstName){
            userData.firstName = firstName;
          }
          if(lastName){
            userData.lastName = lastName;
          }
          if(password){
            userData.hashedPassword = helpers.hash(password);
          }
          // Store the new updates
          _data.update('stocks',phone,userData,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not update the user.'});
            }
          });
        } else {
          callback(400,{'Error' : 'Specified user does not exist.'});
        }
      });
    } else {
      callback(400,{'Error' : 'Missing fields to update.'});
    }
  } else {
    callback(400,{'Error' : 'Missing required field.'});
  }

};

// Required data: phone
// @TODO Only let an authenticated user delete their object. Dont let them delete update elses.
// @TODO Cleanup (delete) any other data files associated with the user
handlers._stocks.delete = function(data,callback){
  // Check that phone number is valid
  let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // Lookup the user
    _data.read('stocks',phone,function(err,data){
      if(!err && data){
        _data.delete('stocks',phone,function(err){
          if(!err){
            callback(200);
          } else {
            callback(500,{'Error' : 'Could not delete the specified user'});
          }
        });
      } else {
        callback(400,{'Error' : 'Could not find the specified user.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};



// Export the handlers
module.exports = handlers;
