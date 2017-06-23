'use strict';

/*
  I considered turning phone into a many to one back to Contact, however in the interest of time,
  I denormalized the schema, as it still satisfies the requirements of the project.
*/

const BPromise = require('bluebird');
const path = require('path');
const sqlite3 = BPromise.promisifyAll(require('sqlite3'));
const contactsCreationScript = `
  CREATE TABLE IF NOT EXISTS
  CONTACT
  (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INTEGER DEFAULT 0,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    favorite INTEGER,
    small_image_url VARCHAR(100),
    large_image_url VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    website VARCHAR(100),
    birthdate INTEGER,
    street_address VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    country VARCHAR(2),
    postal_code VARCHAR(7),
    latitude REAL,
    longitude REAL,
    work_phone VARCHAR(15),
    home_phone VARCHAR(15),
    mobile_phone VARCHAR(15)
  )
`;

/**
 * sqlite-plugin Plugin
 * @param {Object} server - Hapi Server Object
 * @param {Object} options - Options Object. Should be empty
 * @param {Function} next - Callback to Hapi
 */
module.exports = (server, options, next) => {
    let dbPath = path.resolve('lib', 'db', 'index.db');
    let db = new sqlite3.Database(dbPath);

    db.runAsync(contactsCreationScript)
        .then(() => {
            server.expose('db', db);
        })
        .done(next, next);
};

module.exports.attributes = {
    name: 'sqlite-plugin'
};
