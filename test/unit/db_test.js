'use strict';

const BPromise = require('bluebird');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const afterEach = lab.afterEach;
const beforeEach = lab.beforeEach;
const describe = lab.describe;
const sqlite = require('sqlite3');
const dbPlugin = require('../../lib/db');
const it = lab.it;
const should = require('should');
const sinon = require('sinon');

describe('db plugin tests', () => {
    let sandbox = sinon.sandbox.create();
    let dbStub;
    let databaseStub;
    let serverStub;

    afterEach((done) => {
        sandbox.restore();
        done();
    });

    beforeEach((done) => {
        dbStub = {
            runAsync: sandbox.stub().returns(BPromise.resolve())
        };
        databaseStub = sandbox.stub(sqlite, 'Database').returns(dbStub);
        serverStub = {
            expose: sandbox.stub()
        };
        done();
    });

    it('should initialize and expose sqlite3', (done) => {
        dbPlugin(serverStub, {}, (err, cb) => {
            should(databaseStub.callCount).eql(1);
            should(databaseStub.args[0][0]).containEql('lib');
            should(databaseStub.args[0][0]).containEql('db');
            should(databaseStub.args[0][0]).containEql('index.db');

            should(dbStub.runAsync.callCount).eql(1);
            should(dbStub.runAsync.args[0][0]).containEql('CREATE TABLE IF NOT EXISTS\n  CONTACT');

            should(serverStub.expose.callCount).eql(1);

            should.not.exist(err);

            done();
        });
    });
});
