'use strict';

const BPromise = require('bluebird');

/**
 * @typedef {Object} ContactRecord
 * @property {number} id - Primary Key / Contact Id
 * @property {string} date_created - Timestamp
 * @property {string} date_modified - Timestamp
 * @property {number} deleted - 0 false, 1 true
 * @property {string} name
 * @property {string} company
 * @property {number} favorite - 0 false, 1 true
 * @property {string} small_image_url
 * @property {string} large_image_url
 * @property {string} email
 * @property {string} website
 * @property {number} birthdate
 * @property {string} street_address
 * @property {string} city
 * @property {string} state
 * @property {string} country 'US' || 'CA'
 * @property {string} postal_code
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} work_phone
 * @property {string} home_phone
 * @property {string} mobile_phone
 */

/**
 * @typedef {Object} ContactInsertUpdate
 * @property {string} name
 * @property {string} company
 * @property {number} favorite - 0 false, 1 true
 * @property {string} small_image_url
 * @property {string} large_image_url
 * @property {string} email
 * @property {string} website
 * @property {number} birthdate
 * @property {string} street_address
 * @property {string} city
 * @property {string} state
 * @property {string} country 'US' || 'CA'
 * @property {string} postal_code
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} work_phone
 * @property {string} home_phone
 * @property {string} mobile_phone
 */

/**
 * Contact DAO Class
 *
 * @class
 */
class ContactDAO {
    /**
     * constructor - Contact DAO class constructor
     *
     * @param  {Object} db Promisified sqlite DB
     */
    constructor(db) {
        this._db = db;
        this._fields = [
            'name',
            'company',
            'favorite',
            'small_image_url',
            'large_image_url',
            'email',
            'website',
            'birthdate',
            'street_address',
            'city',
            'state',
            'country',
            'postal_code',
            'latitude',
            'longitude',
            'work_phone',
            'home_phone',
            'mobile_phone'
        ];
    }


    /**
     * create - Create a new Contact
     *
     * @param  {ContactInsertUpdate} params Data to create
     * @return {Promise<number>} newly created contact id
     */
    create(params) {
        let query;
        let queryFields = [];
        let queryValues = [];
        let queryParams = {};

        for (let i = 0; i < this._fields.length; i++) {
            if (params.hasOwnProperty(this._fields[i])) {
                queryFields.push(this._fields[i]);
                queryValues.push('$' + this._fields[i]);
                queryParams['$' + this._fields[i]] = params[this._fields[i]];
            }
        }

        query = `INSERT INTO CONTACT (${queryFields.join(', ')}) VALUES (${queryValues.join(', ')})`;

        //sqlite3 is a little wonky with how it passes back "lastId". I had to get a little creative here as promisification won't work
        return new BPromise((resolve, reject) => {
            this._db.run(query, queryParams, function(err) {
                if (err) {
                    return reject(err);
                }
                return resolve(this.lastID);
            });
        });
    }

    /**
     * read - Get a single contact from the Database
     *
     * @param  {number} id Contact id
     * @return {Promise<ContactRecord>}
     */
    read(id) {
        let query = `
          SELECT
            id,
            date_created,
            date_modified,
            ${this._fields.join(', ')}
          FROM
            CONTACT
          WHERE
            id = $id
            AND
            deleted = 0
        `;
        let args = {
            $id: id
        };

        return this._db.getAsync(query, args);
    }


    /**
     * update - Update an Existing Contact
     *
     * @param  {number} id     Contacts Id
     * @param  {ContactInsertUpdate} params
     * @return {Promise<number>} Records Updated
     */
    update(id, params) {
        let query;
        let queryFields = ['date_modified = CURRENT_TIMESTAMP'];
        let queryParams = {
            $id: id
        };

        for (let i = 0; i < this._fields.length; i++) {
            queryFields.push(this._fields[i] + ' = $' + this._fields[i]);
            if (params.hasOwnProperty(this._fields[i])) {
                queryParams['$' + this._fields[i]] = params[this._fields[i]];
            } else {
                queryParams['$' + this._fields[i]] = null;
            }
        }

        query = `UPDATE CONTACT SET ${queryFields.join(', ')} WHERE id = $id`;

        //sqlite3 is a little wonky with how it passes back "changes". I had to get a little creative here as promisification won't work
        return new BPromise((resolve, reject) => {
            this._db.run(query, queryParams, function(err) {
                if (err) {
                    return reject(err);
                }
                return resolve(this.changes);
            });
        });
    }

    /**
     * delete - Deletes a contact
     *
     * @param  {number} id contact id
     * @return {Promise<number>} records updated
     */
    delete(id) {
        let query = `
        UPDATE
        CONTACT
          SET
            deleted = 1,
            date_modified = CURRENT_TIMESTAMP
        WHERE
          id = $id
      `;
        let args = {
            $id: id
        };

        //sqlite3 is a little wonky with how it passes back "changes". I had to get a little creative here as promisification won't work
        return new BPromise((resolve, reject) => {
            this._db.run(query, args, function(err) {
                if (err) {
                    return reject(err);
                }
                return resolve(this.changes);
            });
        });
    }
}

module.exports = ContactDAO;
