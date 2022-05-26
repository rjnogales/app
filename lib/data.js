/*
 * Library for storing and editing data
 *
 */

// Dependencies
let fs = require('fs');
let path = require('path');

// Container for module (to be exported)
let lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname,'/../.data/');

// Write data to a file
lib.create = function(dir,file,data,callback){
  // Open the file for writing
  fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string
      let stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData,function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err){
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });

};

// Read data from a file
lib.read = function(dir,file,callback){
  fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err,data){
      callback(err,data);
    });
};

// Add data in a file
lib.add = function(dir,file,data,callback){

  // Convert data to string
      let stringData = JSON.stringify(data);

  // add data
  fs.appendFile(lib.baseDir+dir+'/'+file+'.json', stringData, function(err,data){
    callback(err,stringData);
  });
};


// Delete a file
lib.delete = function(dir,file,callback){

  // Unlink the file from the filesystem
  fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
    callback(err);
  });

};

// Export the module
module.exports = lib;
