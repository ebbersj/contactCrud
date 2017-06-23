'use strict';

const BPromise = require('bluebird');
const Chance = require('chance');
const chance = new Chance();
const DAO = require('../../../lib/dao/contact');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const afterEach = lab.afterEach;
const beforeEach = lab.beforeEach;
const describe = lab.describe;
const it = lab.it;
const should = require('should');
const sinon = require('sinon');

describe('Contact DAO tests', () => {
    let sandbox = sinon.sandbox.create();
    let contactDAO;
    let dbStub;
    let params;

    afterEach((done) => {
        sandbox.restore();
        done();
    });

    beforeEach((done) => {
        dbStub = {
            getAsync: sandbox.stub(),
            run: sandbox.stub(),
            runAsync: sandbox.stub()
        };
        contactDAO = new DAO(dbStub);
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

    describe('Create Contact', (done) => {
        it('Should insert a record with all fields', (done) => {
            let resultId = chance.natural();

            dbStub.run.callsArgOn(2, {
                lastID: resultId
            });
            contactDAO.create(params)
                .then((result) => {
                    should.exist(result);
                    should(result).eql(resultId);
                    should(dbStub.run.callCount).eql(1);
                    should(dbStub.run.args[0][0]).containEql('INSERT INTO CONTACT');
                    Object.keys(params).forEach((item) => {
                        should(dbStub.run.args[0][0]).containEql(item);
                        should(dbStub.run.args[0][0]).containEql(`$${item}`);
                        should(dbStub.run.args[0][1]).have.property(`$${item}`).eql(params[item]);
                    });
                })
                .done(done, done);
        });

        it('Should insert a partial record', (done) => {
            let resultId = chance.natural();
            delete params.company;

            dbStub.run.callsArgOn(2, {
                lastID: resultId
            });

            contactDAO.create(params)
                .then((result) => {
                    should.exist(result);
                    should(result).eql(resultId);
                    should(dbStub.run.callCount).eql(1);
                    should(dbStub.run.args[0][0]).containEql('INSERT INTO CONTACT');
                    Object.keys(params).forEach((item) => {
                        should(dbStub.run.args[0][0]).containEql(item);
                        should(dbStub.run.args[0][0]).containEql(`$${item}`);
                        should(dbStub.run.args[0][1]).have.property(`$${item}`).eql(params[item]);
                    });
                })
                .done(done, done);
        });

        it('Create should reject on Error', (done) => {
            let testError = new Error(chance.word());

            dbStub.run.callsArgWith(2, testError);

            contactDAO.create(params)
                .then((res) => {
                    done('Should have rejected');
                })
                .catch((err) => {
                    should.exist(err);
                    should(err).be.instanceof(Error);
                })
                .done(done, done);
        });
    });

    describe('Read Contact', () => {
        it('Should query a record from the database', (done) => {
            let id = chance.natural();
            dbStub.getAsync.returns(BPromise.resolve(params));

            contactDAO.read(id)
                .then((result) => {
                    should.exist(result);
                    should(result).eql(params);
                    should(dbStub.getAsync.callCount).eql(1);
                    should(dbStub.getAsync.args[0][0]).containEql('SELECT');
                    should(dbStub.getAsync.args[0][0]).containEql('id = $id');
                    Object.keys(params).forEach((item) => {
                        should(dbStub.getAsync.args[0][0]).containEql(item);
                    });

                    should(dbStub.getAsync.args[0][1]).have.property('$id').eql(id);
                })
                .done(done, done);
        });
    });

    describe('Update Contact', () => {
        it('Should update all fields on a record in the database', (done) => {
            let id = chance.natural();

            dbStub.run.callsArgOn(2, {
                changes: 1
            });
            contactDAO.update(id, params)
                .then((result) => {
                    should.exist(result);
                    should(result).eql(1);
                    should(dbStub.run.callCount).eql(1);
                    should(dbStub.run.args[0][0]).containEql('UPDATE CONTACT SET');
                    should(dbStub.run.args[0][0]).containEql('date_modified = CURRENT_TIMESTAMP');
                    should(dbStub.run.args[0][0]).containEql('WHERE id = $id');
                    should(dbStub.run.args[0][1]).have.property('$id').eql(id);
                    Object.keys(params).forEach((item) => {
                        should(dbStub.run.args[0][0]).containEql(item + ' = $' + item);
                        should(dbStub.run.args[0][1]).have.property(`$${item}`).eql(params[item]);
                    });
                })
                .done(done, done);
        });

        it('Should update nulls to records not passed in', (done) => {
            let id = chance.natural();

            delete params.company;

            dbStub.run.callsArgOn(2, {
                changes: 1
            });
            contactDAO.update(id, params)
                .then((result) => {
                    should.exist(result);
                    should(result).eql(1);
                    should(dbStub.run.callCount).eql(1);
                    Object.keys(params).forEach((item) => {
                        should(dbStub.run.args[0][0]).containEql(item + ' = $' + item);
                        should(dbStub.run.args[0][1]).have.property(`$${item}`).eql(params[item]);
                    });
                    should(dbStub.run.args[0][0]).containEql('company = $company');
                    should(dbStub.run.args[0][1]).have.property('$company').eql(null);
                })
                .done(done, done);
        });

        it('Should reject on error', (done) => {
            let id = chance.natural();
            let testError = new Error(chance.word());

            dbStub.run.callsArgWith(2, testError);

            contactDAO.update(id, params)
                .then((res) => {
                    done('Should have rejected');
                })
                .catch((err) => {
                    should.exist(err);
                    should(err).be.instanceof(Error);
                })
                .done(done, done);
        });
    });

    describe('Delete Contact', (done) => {
        it('Should Delete a record', (done) => {
            let id = chance.natural();

            dbStub.run.callsArgOn(2, {
                changes: 1
            });

            contactDAO.delete(id)
                .then((result) => {
                    should.exist(result);
                    should(result).eql(1);
                    should(dbStub.run.callCount).eql(1);
                    should(dbStub.run.args[0][0]).containEql('UPDATE').containEql('CONTACT').containEql('SET');
                    should(dbStub.run.args[0][0]).containEql('date_modified = CURRENT_TIMESTAMP');
                    should(dbStub.run.args[0][0]).containEql('deleted = 1');
                    should(dbStub.run.args[0][0]).containEql('WHERE').containEql('id = $id');
                    should(dbStub.run.args[0][1]).have.property('$id').eql(id);
                })
                .done(done, done);
        });

        it('Should bubble up errors', (done) => {
            let id = chance.natural();
            let testError = new Error(chance.word());

            dbStub.run.callsArgWith(2, testError);

            contactDAO.delete(id)
                .then((res) => {
                    done('Should have rejected');
                })
                .catch((err) => {
                    should.exist(err);
                    should(err).be.instanceof(Error);
                })
                .done(done, done);
        });
    });
});
