'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const afterEach = lab.afterEach;
const describe = lab.describe;
const Glue = require('glue');
const index = require('../../lib/');
const it = lab.it;
const should = require('should');
const sinon = require('sinon');

describe('hapi server tests', () => {
    let sandbox = sinon.sandbox.create();

    afterEach((done) => {
        sandbox.restore();

        done();
    });

    it('should start up and not throw', (done) => {
        index.getServer((err, server) => {
            should.not.exist(err);
            should.exist(server);
            server.stop();
            done();
        });
    });

    it('should return errors', (done) => {
        let composeStub = sandbox.stub(Glue, 'compose').callsArgWith(2, new Error('boom'));

        index.getServer((err, server) => {
            composeStub.restore();
            should.exist(err);
            done();
        });
    });
});
