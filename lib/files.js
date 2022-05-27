/*
 * Library for storing and editing data
 *
 */

// Dependencies
let fs = require('fs');
let path = require('path');

// Container for module (to be exported)
let files = {};

// Base directory of data folder
files.baseDir = path.join(__dirname,'/../.data/');

// Read data from a file
files.read = function(dir,file,callback){
  fs.readFile(files.baseDir+dir+'/'+file, 'utf8', function(err,data){
      callback(err,data);
    });
};

// Add data in a file
files.write = function(dir,file,data,callback){

  // Convert data to string
  let stringData = JSON.stringify(data);

  // add data
  fs.writeFile(files.baseDir+dir+'/'+file, stringData, function(err,data){
    callback(err,stringData);
  });
};

// Export the module
module.exports = files;
