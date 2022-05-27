/*
 * Utils for various tasks
 *
 */


// Container for all the utils
const utils = {};

// Parse a JSON string to an object in all cases, without throwing
utils.parseJsonToObject = function(str){
  try{
    let obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

// Export the module
module.exports = utils;
