'use strict';

const ContactDAO = require('../dao/contact');
const internals = {
    getPath: '/v1/contact/$id'
};

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
 * @typedef {Object} CreateContactResponse
 * @property {string} uri - URI of the newly created resource
 * @property {number} id - Contact Id of the newly created resource
 */

/**
 * @typedef {Object} UpdateContactResponse
 * @property {boolean} updated
 */

/**
 * @typedef {Object} DeleteContactResponse
 * @property {boolean} deleted
 */

/**
 * Contact Service class
 * @class
 */
class ContactService {

    /**
     * constructor - Contact Service Constructor
     *
     * @param  {Object} db Promisified sqlite DB
     */
    constructor(db) {
        this._db = db;
        this.contactDAO = new ContactDAO(db);
    }

    /**
     * create - Create a Contact
     *
     * @param  {ContactInsertUpdate} params Data to create
     * @return {Promise<string>} URI of the newly created resource
     */
    create(params) {
        return this.contactDAO.create(params)
            .then((id) => {
                return {
                    uri: internals.getPath.replace('$id', id),
                    id: id
                };
            });
    }

    /**
     * read - Get a single Contact
     *
     * @param  {number} id contact id
     * @return {Promise<Array.ContactRecord>} Contact Record
     */
    read(id) {
        return this.contactDAO.read(id)
            .then((resp) => {
                if (resp) {
                    return [resp];
                }
                return [];
            });
    }


    /**
     * update - Update an existing contact
     *
     * @param  {number} id                      Contact Id
     * @param  {ContactInsertUpdate} params     arguments
     * @return {Promise<UpdateContactResponse>} Update Status
     */
    update(id, params) {
        return this.contactDAO.update(id, params)
            .then((resp) => {
                if (resp) {
                    return {
                        updated: true
                    };
                }
                return {
                    updated: false
                };
            });
    }


    /**
     * delete - Delete a Contact
     *
     * @param  {number} id Contact Id
     * @return {Promise<DeleteContactResponse>} Delete Status
     */
    delete(id) {
        return this.contactDAO.delete(id)
            .then((resp) => {
                if (resp) {
                    return {
                        deleted: true
                    };
                }
                return {
                    deleted: false
                };
            });
    }
}

module.exports = ContactService;
