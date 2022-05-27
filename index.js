/*
 * Primary file for API
 *
 */[]

// Dependencies
let server = require('./lib/server');

server.init();
/*

DEL:localhost:3000/stock/<symbol> : borra el simbolo a la lista de monitoreo. EG:localhost:3000/stock/AAPL
GET:localhost:3000/stock/<symbol> : trae un solo simbolo a la lista de monitoreo. EG: localhost:3000/stock/AAPL
GET:localhost:3000/stock/<symbol>?update : trae un solo simbolo a la lista de monitoreo pero actualizando el valor
 usando iexcloud. EG: localhost:3000/stock/AAPL?update
GET:localhost:3000/stock : trae todos los simbolos de la lista de monitoreo. EG: localhost:3000/stock
GET:localhost:3000/stock?update ...: trae todos los simbolos de la lista de monitoreo. EG: localhost:3000/stock/?update

Las consultas GET deberian soportar el query param ?update para que al estar incluido actualice los valores 
 usando iexcloud


*/
