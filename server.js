let http = require('http');

let dbConfig = require('./config/mongodb');
let app = require('./config/express');

dbConfig().catch(console.dir);

let server = http.createServer(app);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`==== The server is running on port ${PORT}.`);
});