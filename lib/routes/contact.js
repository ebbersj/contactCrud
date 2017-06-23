'use strict';

const Boom = require('boom');
const ContactService = require('../service/contact');
const Hoek = require('hoek');
const Joi = require('joi');

const internals = {
    validPhone: Joi.string().regex(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/)
};

internals.fullPayload = Joi.object().keys({
    name: Joi.string().min(3).max(100).required(),
    company: Joi.string().max(100),
    favorite: Joi.boolean(),
    smallImageURL: Joi.string().max(100).uri(),
    largeImageURL: Joi.string().max(100).uri(),
    email: Joi.string().max(100).email().required(),
    website: Joi.string().max(100).uri(),
    birthdate: Joi.number().positive().integer(),
    phone: {
        work: internals.validPhone,
        home: internals.validPhone,
        mobile: internals.validPhone
    },
    address: Joi.object().keys({
        street: Joi.string().max(100),
        city: Joi.string().max(100),
        state: Joi.string().max(2),
        country: Joi.string().valid(['US', 'CA']),
        zip: Joi.alternatives().try(Joi.string().min(5).max(5).regex(/^\d+$/), Joi.string().min(7).max(7).regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/)),
        latitude: Joi.number().precision(6),
        longitude: Joi.number().precision(6)
    })
});

internals.contactId = Joi.object().keys({
    id: Joi.number().integer().required()
});

/**
 * @typedef contactPayload
 * @property {string} name
 * @property {string} company
 * @property {string} smallImageURL
 * @property {string} largeImageURL
 * @property {string} email
 * @property {string} website
 * @property {number} birthday
 * @property {object} phone
 * @property {string} phone.work
 * @property {string} phone.home
 * @property {string} phone.mobile
 * @property {object} address
 * @property {string} address.street
 * @property {string} address.city
 * @property {string} address.state
 * @property {string} address.country
 * @property {string} address.zip
 * @property {number} address.latitude
 * @property {number} address.longitude
 */

/**
 * @typedef {Object} Contact
 * @property {string} name
 * @property {string} company
 * @property {string} small_image_url
 * @property {string} large_image_url
 * @property {string} email
 * @property {string} website
 * @property {number} birthday
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
 * module.exports.create - Create Contact Route
 *
 * @param  {Object} request Hapi request object
 * @param  {Object} reply   Hapi reply object
 */
module.exports.create = function(request, reply) {
    //this.db utilizes the bind feature of Hapi. Set in the plugin routes/index.js
    let contactService = new ContactService(this.db);
    let payload = internals.flattenPayload(request.payload);

    contactService.create(payload)
        .then((resp) => {
            return reply()
                .header('Location', resp.uri)
                .code(201);
        })
        .catch(reply);
};

module.exports.create.validate = {
    payload: internals.fullPayload
};


/**
 * module.exports.read - Read a Contact Route
 *
 * @param  {Object} request Hapi request object
 * @param  {Object} reply   Hapi reply object
 */
module.exports.read = function(request, reply) {
    //this.db utilizes the bind feature of Hapi. Set in the plugin routes/index.js
    let contactService = new ContactService(this.db);

    contactService.read(request.params.id)
        .then(function(resp) {
            if (resp.length) {
                return reply(internals.buildPayload(resp[0]));
            }
            return reply(Boom.notFound('Not Found'));
        })
        .catch(reply);
};

module.exports.read.validate = {
    params: internals.contactId
};

/**
 * module.exports.update - Update a Contact Route
 *
 * @param  {Object} request Hapi request object
 * @param  {Object} reply   Hapi reply object
 */
module.exports.update = function(request, reply) {
    //this.db utilizes the bind feature of Hapi. Set in the plugin routes/index.js
    let contactService = new ContactService(this.db);
    let payload = internals.flattenPayload(request.payload);

    contactService.update(request.params.id, payload)
        .then((resp) => {
            if (resp.updated) {
                return contactService.read(request.params.id)
                    .then((resp) => {
                        if (resp.length) {
                            return internals.buildPayload(resp[0]);
                        }
                        return Boom.notFound('Not Found');
                    });
            }
            return Boom.notFound('Not Found');
        })
        .done(reply, reply);
};

module.exports.update.validate = {
    params: internals.contactId,
    payload: internals.fullPayload
};

/**
 * module.exports.delete - Delete a Contact Route
 *
 * @param  {Object} request Hapi request object
 * @param  {Object} reply   Hapi reply object
 */
module.exports.delete = function(request, reply) {
    //this.db utilizes the bind feature of Hapi. Set in the plugin routes/index.js
    let contactService = new ContactService(this.db);

    contactService.delete(request.params.id)
        .then((resp) => {
            if (resp.deleted) {
                return reply()
                    .code(200);
            }
            return reply(Boom.notFound('Not Found'));
        })
        .catch(reply);
};

module.exports.delete.validate = {
    params: internals.contactId
};

/**
 * internals.flattenPayload - flattens a contact payload into a contact
 *
 * @param  {contactPayload} payload
 * @return {Contact}
 */
internals.flattenPayload = (payload) => {
    payload = Hoek.clone(payload);

    if (payload.favorite) {
        payload.favorite = 1;
    } else {
        payload.favorite = 0;
    }

    return Hoek.transform(payload, {
        name: 'name',
        company: 'company',
        favorite: 'favorite',
        small_image_url: 'smallImageURL',
        large_image_url: 'largeImageURL',
        email: 'email',
        website: 'website',
        birthdate: 'birthdate',
        street_address: 'address.street',
        city: 'address.city',
        state: 'address.state',
        country: 'address.country',
        postal_code: 'address.zip',
        latitude: 'address.latitude',
        longitude: 'address.longitude',
        work_phone: 'phone.work',
        home_phone: 'phone.home',
        mobile_phone: 'phone.mobile'
    });
};

/**
 * internals.buildPayload - Reverses the flatten process
 *
 * @param  {Contact} payload
 * @return {contactPayload}
 */
internals.buildPayload = (payload) => {
    payload = Hoek.clone(payload);

    if (payload.favorite === 1) {
        payload.favorite = true;
    } else {
        payload.favorite = false;
    }

    return Hoek.transform(payload, {
        name: 'name',
        company: 'company',
        favorite: 'favorite',
        smallImageURL: 'small_image_url',
        largeImageURL: 'large_image_url',
        email: 'email',
        website: 'website',
        birthdate: 'birthdate',
        'address.street': 'street_address',
        'address.city': 'city',
        'address.state': 'state',
        'address.country': 'country',
        'address.zip': 'postal_code',
        'address.latitude': 'latitude',
        'address.longitude': 'longitude',
        'phone.work': 'work_phone',
        'phone.home': 'home_phone',
        'phone.mobile': 'mobile_phone'
    });
};
