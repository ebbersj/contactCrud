'use strict';

const index = require('./lib');

index.getServer((err, server) => {
    if (err) {
        throw (err);
    }
    console.log(`Server listning: ${server.info.uri}`);
});
