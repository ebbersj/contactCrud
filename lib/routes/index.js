'use strict';

const contactRoutes = require('./contact');

module.exports = (server, options, next) => {
    const bind = {
        db: server.plugins['sqlite-plugin'].db
    };
    server.bind(bind);

    server.route({
        method: 'POST',
        path: '/v1/contact',
        handler: contactRoutes.create,
        config: {
            validate: contactRoutes.create.validate
        }
    });

    server.route({
        method: 'GET',
        path: '/v1/contact/{id}',
        handler: contactRoutes.read,
        config: {
            validate: contactRoutes.read.validate
        }
    });

    server.route({
        method: 'PUT',
        path: '/v1/contact/{id}',
        handler: contactRoutes.update,
        config: {
            validate: contactRoutes.update.validate
        }
    });

    server.route({
        method: 'DELETE',
        path: '/v1/contact/{id}',
        handler: contactRoutes.delete,
        config: {
            validate: contactRoutes.delete.validate
        }
    });

    next();
};

module.exports.attributes = {
    name: 'routes'
};
