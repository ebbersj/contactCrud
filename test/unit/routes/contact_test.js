'use strict';

const BPromise = require('bluebird');
const Chance = require('chance');
const chance = new Chance();
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const afterEach = lab.afterEach;
const before = lab.before;
const beforeEach = lab.beforeEach;
const describe = lab.describe;
const index = require('../../../lib/');
const it = lab.it;
const ContactService = require('../../../lib/service/contact');
const should = require('should');
const sinon = require('sinon');

describe('Contact Routes', () => {
    let sandbox = sinon.sandbox.create();
    let serverInstance;
    let createStub;
    let readStub;
    let updateStub;
    let deleteStub;
    let payload;
    let payloadFlattened;

    before((done) => {
        index.getServer((err, server) => {
            if (err) {
                return done(err);
            }
            serverInstance = server;
            done();
        });
    });

    beforeEach((done) => {
        createStub = sandbox.stub(ContactService.prototype, 'create');
        readStub = sandbox.stub(ContactService.prototype, 'read');
        updateStub = sandbox.stub(ContactService.prototype, 'update');
        deleteStub = sandbox.stub(ContactService.prototype, 'delete');
        payload = {
            name: chance.first() + ' ' + chance.last(),
            company: chance.word(),
            favorite: true,
            smallImageURL: chance.url(),
            largeImageURL: chance.url(),
            email: chance.email(),
            website: chance.url(),
            birthdate: chance.timestamp(),
            phone: {
                work: `${chance.natural({min:100, max: 999})}-${chance.natural({min:100, max: 999})}-${chance.natural({min:1000, max: 9999})}`,
                home: `${chance.natural({min:100, max: 999})}-${chance.natural({min:100, max: 999})}-${chance.natural({min:1000, max: 9999})}`,
                mobile: `${chance.natural({min:100, max: 999})}-${chance.natural({min:100, max: 999})}-${chance.natural({min:1000, max: 9999})}`
            },
            address: {
                street: chance.address(),
                city: chance.city(),
                state: chance.state(),
                country: chance.pickone(['US', 'CA']),
                zip: chance.pickone([chance.zip(), chance.postal()]),
                latitude: chance.latitude({
                    fixed: 5
                }),
                longitude: chance.longitude({
                    fixed: 5
                })
            }
        };

        payloadFlattened = {
            name: payload.name,
            company: payload.company,
            favorite: 1,
            small_image_url: payload.smallImageURL,
            large_image_url: payload.largeImageURL,
            email: payload.email,
            website: payload.website,
            birthdate: payload.birthdate,
            work_phone: payload.phone.work,
            home_phone: payload.phone.home,
            mobile_phone: payload.phone.mobile,
            street_address: payload.address.street,
            city: payload.address.city,
            state: payload.address.state,
            country: payload.address.country,
            postal_code: payload.address.zip,
            latitude: payload.address.latitude,
            longitude: payload.address.longitude
        };

        done();
    });

    afterEach((done) => {
        sandbox.restore();

        done();
    });

    describe('Create Route', () => {
        it('should call create', (done) => {
            let expected = {
                id: chance.natural(),
                uri: `/v1/contact/${chance.natural()}`
            };
            let opts = {
                method: 'POST',
                url: '/v1/contact',
                payload: payload
            };
            createStub.returns(BPromise.resolve(expected));
            serverInstance.inject(opts)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('statusCode').eql(201);
                    should(resp).have.property('headers').have.property('location').eql(expected.uri);

                    should(createStub.callCount).eql(1);
                    should(createStub.args[0][0]).eql(payloadFlattened);
                    done();
                })
                .catch(done);
        });
    });

    describe('Read Route', (done) => {
        it('Should return a Contact', (done) => {
            let actual;
            let id = chance.natural();
            let opts = {
                method: 'GET',
                url: `/v1/contact/${id}`
            };
            readStub.returns(BPromise.resolve([payloadFlattened]));
            serverInstance.inject(opts)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('statusCode').eql(200);
                    actual = JSON.parse(resp.payload);
                    should(actual).eql(payload);
                    should(readStub.callCount).eql(1);
                    should(readStub.args[0][0]).eql(id);

                    done();
                })
                .catch(done);
        });

        it('Should 404', (done) => {
            let actual;
            let expected = {
                statusCode: 404,
                message: 'Not Found',
                error: 'Not Found'
            };
            let id = chance.natural();
            let opts = {
                method: 'GET',
                url: `/v1/contact/${id}`
            };
            readStub.returns(BPromise.resolve([]));
            serverInstance.inject(opts)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('statusCode').eql(404);
                    actual = JSON.parse(resp.payload);
                    should(actual).eql(expected);
                    done();
                })
                .catch(done);
        });
    });

    describe('Update Route', () => {
        it('Should update and return the updated record', (done) => {
            let actual;
            let id = chance.natural();
            let opts = {
                method: 'PUT',
                url: `/v1/contact/${id}`,
                payload: payload
            };
            opts.payload.favorite = false;
            payloadFlattened.favorite = 0;

            readStub.returns(BPromise.resolve([payloadFlattened]));
            updateStub.returns(BPromise.resolve({
                updated: true
            }));

            serverInstance.inject(opts)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('statusCode').eql(200);
                    actual = JSON.parse(resp.payload);
                    should(actual).eql(payload);

                    should(updateStub.callCount).eql(1);
                    should(updateStub.args[0][0]).eql(id);
                    should(updateStub.args[0][1]).eql(payloadFlattened);

                    should(readStub.callCount).eql(1);
                    should(readStub.args[0][0]).eql(id);

                    done();
                })
                .catch(done);
        });

        it('Should 404 on no update', (done) => {
            let actual;
            let expected = {
                statusCode: 404,
                message: 'Not Found',
                error: 'Not Found'
            };
            let id = chance.natural();
            let opts = {
                method: 'PUT',
                url: `/v1/contact/${id}`,
                payload: payload
            };

            readStub.returns(BPromise.resolve([payloadFlattened]));
            updateStub.returns(BPromise.resolve({
                updated: false
            }));

            serverInstance.inject(opts)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('statusCode').eql(404);
                    actual = JSON.parse(resp.payload);
                    should(actual).eql(expected);
                    done();
                })
                .catch(done);
        });

        it('Should 404 on failed read', (done) => {
            let actual;
            let expected = {
                statusCode: 404,
                message: 'Not Found',
                error: 'Not Found'
            };
            let id = chance.natural();
            let opts = {
                method: 'PUT',
                url: `/v1/contact/${id}`,
                payload: payload
            };

            readStub.returns(BPromise.resolve([]));
            updateStub.returns(BPromise.resolve({
                updated: true
            }));

            serverInstance.inject(opts)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('statusCode').eql(404);
                    actual = JSON.parse(resp.payload);
                    should(actual).eql(expected);
                    done();
                })
                .catch(done);
        });
    });

    describe('Delete Route', () => {
        it('Should delete a record', (done) => {
            let id = chance.natural();
            let opts = {
                method: 'DELETE',
                url: `/v1/contact/${id}`
            };
            deleteStub.returns(BPromise.resolve({
                deleted: true
            }));

            serverInstance.inject(opts)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('statusCode').eql(200);

                    should(deleteStub.callCount).eql(1);
                    should(deleteStub.args[0][0]).eql(id);
                    done();
                })
                .catch(done);
        });

        it('Should 404 on no record', (done) => {
            let actual;
            let expected = {
                statusCode: 404,
                message: 'Not Found',
                error: 'Not Found'
            };
            let id = chance.natural();
            let opts = {
                method: 'DELETE',
                url: `/v1/contact/${id}`
            };
            deleteStub.returns(BPromise.resolve({
                deleted: false
            }));

            serverInstance.inject(opts)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('statusCode').eql(404);
                    actual = JSON.parse(resp.payload);
                    should(actual).eql(expected);
                    done();
                })
                .catch(done);
        });
    });
});
