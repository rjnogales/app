/*
 * Library for handling db interactions
 *
 */

const files = require('./files');
const externalAPI = require('./externalAPI');

const db = {};

// Database in memory
db._db = {};

async function initializeDB() {
    let promise = new Promise(function (resolve, reject) {
        files.read('','stocks.json', function (err, initialData) {
            if(err) reject(err);
            else {
                console.log('Loaded database from disk', initialData);
                db._db = JSON.parse(initialData);
                resolve(db);    
            }
        });
    })
    return promise;
}

async function writeDB() {
    let promise = new Promise(function (resolve, reject) {
        files.write('','stocks.json', db._db, function (err, writtenData) {
            if(err) reject(err);
            else {
                console.log('Wrote database to disk', writtenData);
                resolve(writtenData);
            }
        });
    })
    return promise;
}

db.addStock = async function addStock(symbol) {
    console.log('Trying to add symbol', symbol);
    if(!db._db[symbol]) {
        console.log('Symbol was not found, adding it.');
        let newSymbolObject = await externalAPI.getSymbolInfo(symbol)
        db._db[symbol] = newSymbolObject;
        console.log('DB before write symbol', );
        await writeDB();
    }

    console.log('Added symbol to DB:', db._db[symbol]);
    return db._db[symbol];
}

db.removeStock = async function removeStock(symbol) {
    console.log('Trying to remove symbol', symbol);
    if(db._db[symbol]) {
        console.log('Symbol was found, removing it.');
        delete db._db[symbol];
        await writeDB();
    }

    console.log('Removed symbol to DB:', db._db[symbol]);
    return db._db[symbol];
}

db.updateStock = async function updateStock(symbol, writeToDB = true) {
    console.log('Trying to add symbol', symbol);
    if(db._db[symbol]) {
        console.log('Symbol was found, updating it.');
        db._db[symbol] = await externalAPI.getSymbolInfo(symbol);
        if(writeToDB) await writeDB();
        console.log('Updated symbol to DB:', db._db[symbol]);
        return db._db[symbol];
    } else {
        throw new Error('Stock is not present in the DB');
    }
}

db.updateAllStocks = async function updateAllStocks() {
    let symbols = Object.keys(db._db);
    let promiseArray = symbols.map(function(symbol) {
        return db.updateStock(symbol, false);
    });
    let bigPromise = Promise.all(promiseArray);
    await writeDB();
    return bigPromise; 
}

db.getStock = function getStock(symbol) {
    return db._db[symbol];
}

db.getAllStocks = function getStock(symbol) {
    return db._db;
}

module.exports = initializeDB;