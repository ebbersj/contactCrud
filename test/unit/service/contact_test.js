'use strict';

const BPromise = require('bluebird');
const Chance = require('chance');
const chance = new Chance();
const DAO = require('../../../lib/dao/contact');
const Service = require('../../../lib/service/contact');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const afterEach = lab.afterEach;
const beforeEach = lab.beforeEach;
const describe = lab.describe;
const it = lab.it;
const should = require('should');
const sinon = require('sinon');

describe('Contact Service', () => {
    let sandbox = sinon.sandbox.create();
    let serviceDAO;
    let dbStub;
    let params;

    afterEach((done) => {
        sandbox.restore();

        done();
    });

    beforeEach((done) => {
        dbStub = sandbox.stub();
        serviceDAO = new Service(dbStub);
        params = {
            name: chance.first() + ' ' + chance.last(),
            company: chance.word(),
            favorite: chance.pickone([0, 1]),
            small_image_url: chance.url(),
            large_image_url: chance.url(),
            email: chance.email(),
            website: chance.url(),
            birthdate: chance.timestamp(),
            street_address: chance.address(),
            city: chance.city(),
            state: chance.state(),
            country: chance.pickone(['US', 'CA']),
            postal_code: chance.pickone([chance.zip(), chance.postal()]),
            latitude: chance.latitude({
                fixed: 5
            }),
            longitude: chance.longitude({
                fixed: 5
            }),
            work_phone: chance.phone(),
            home_phone: chance.phone(),
            mobile_phone: chance.phone()
        };

        done();
    });

    describe('Create Contact', () => {
        let createStub;

        beforeEach((done) => {
            createStub = sandbox.stub(DAO.prototype, 'create');

            done();
        });

        it('Should returnthe URI', (done) => {
            let id = chance.natural();

            createStub.returns(BPromise.resolve(id));

            serviceDAO.create(params)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('uri').eql('/v1/contact/' + id);
                    should(resp).have.property('id').eql(id);
                    should(createStub.callCount).eql(1);
                    should(createStub.args[0][0]).eql(params);
                })
                .done(done, done);
        });
    });

    describe('Read Contact', () => {
        let readStub;

        beforeEach((done) => {
            readStub = sandbox.stub(DAO.prototype, 'read');

            done();
        });

        it('shoud return the record as an array', (done) => {
            let id = chance.natural();
            readStub.returns(BPromise.resolve(params));

            serviceDAO.read(id)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).be.an.Array();
                    should(resp.length).eql(1);
                    should(resp[0]).eql(params);

                    should(readStub.callCount).eql(1);
                    should(readStub.args[0][0]).eql(id);
                })
                .done(done, done);
        });

        it('should return an empty array on no record', (done) => {
            let id = chance.natural();
            readStub.returns(BPromise.resolve(undefined));

            serviceDAO.read(id)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).be.an.Array();
                    should(resp.length).eql(0);
                })
                .done(done, done);
        });
    });

    describe('Update Contact', () => {
        let updateStub;

        beforeEach((done) => {
            updateStub = sandbox.stub(DAO.prototype, 'update');

            done();
        });

        it('should return true on a record found', (done) => {
            let id = chance.natural();
            updateStub.returns(BPromise.resolve(1));

            serviceDAO.update(id, params)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('updated').eql(true);

                    should(updateStub.callCount).eql(1);
                    should(updateStub.args[0][0]).eql(id);
                    should(updateStub.args[0][1]).eql(params);
                })
                .done(done, done);
        });

        it('should return false on no record found', (done) => {
            let id = chance.natural();
            updateStub.returns(BPromise.resolve(0));

            serviceDAO.update(id, params)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('updated').eql(false);
                })
                .done(done, done);
        });
    });

    describe('Delete Contact', () => {
        let deleteStub;

        beforeEach((done) => {
            deleteStub = sandbox.stub(DAO.prototype, 'delete');

            done();
        });

        it('should return true on a record found', (done) => {
            let id = chance.natural();
            deleteStub.returns(BPromise.resolve(1));

            serviceDAO.delete(id)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('deleted').eql(true);

                    should(deleteStub.callCount).eql(1);
                    should(deleteStub.args[0][0]).eql(id);
                })
                .done(done, done);
        });

        it('should return false on no record found', (done) => {
            let id = chance.natural();
            deleteStub.returns(BPromise.resolve(0));

            serviceDAO.delete(id)
                .then((resp) => {
                    should.exist(resp);
                    should(resp).have.property('deleted').eql(false);
                })
                .done(done, done);
        });
    });
});
