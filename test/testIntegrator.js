var Promise = require('bluebird');
var integrator = require('../lib/integrator');
var assert = require('chai').assert;
var debug = require('debug')('ob-sidekick');

var firstFollower = {};

describe('integrator', function() {

    this.timeout(5000);

    it('should login', function() {
        return integrator.login()
            .then(function(reply) {
                debug(reply)
                assert.isArray(reply);
                assert.equal(reply[0], 200);
                assert.isObject(reply[1]);
            })
            .catch(function(err) {
                throw err;
            });
    });

    it('should get listings', function() {
        return integrator.getListings()
            .then(function(reply) {
                debug(reply);
                assert.isArray(reply);
                // reply[0] is the HTTP code
                // ex: [code, body] (err is not here, if exists it gets caught)
                assert.equal(reply[0], 200);
                assert.isObject(reply[1]);
                assert.isArray(reply[1].listings);
            })
            .catch(function(err) {
                throw err;
            });
    });

    it('should get followers', function() {
        return integrator.getFollowers()
            .then(function(reply) {
                debug(reply);
                assert.isArray(reply);
                // reply[0] is the HTTP code
                // ex: [code, body] (err is not here, if exists it gets caught)
                assert.equal(reply[0], 200);
                assert.isObject(reply[1]);
                assert.isArray(reply[1].followers);
                assert.isNumber(reply[1].count);
                firstFollower = JSON.parse(JSON.stringify(reply[1].followers[0]));
            })
            .catch(function(err) {
                throw err;
            });
    });


    it('should get followers array starting at a given index', function() {
        debug(firstFollower)
        assert.isString(firstFollower.name);
        assert.isString(firstFollower.guid);

        return integrator.getFollowers({"start": 4})
            .then(function(reply) {
                debug('%s should not equal %s', firstFollower.name, reply[1].followers[0].name);
                assert.notEqual(firstFollower, reply[1].followers[0]);
                assert.isArray(reply);
                // reply[0] is the HTTP code
                // ex: [code, body] (err is not here, if exists it gets caught)
                assert.equal(reply[0], 200);
                assert.isObject(reply[1]);
                assert.isArray(reply[1].followers);
                assert.isNumber(reply[1].count);
            })
            .catch(function(err) {
                throw err;
            });
    });
});
