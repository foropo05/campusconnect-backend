let http = require('http');

let dbConfig = require('./config/mongodb');
let app = require('./config/express');

dbConfig().catch(console.dir);

let server = http.createServer(app);

server.listen(3000);

console.log('==== The server is running.');