var Promise = require('bluebird');
var integrator = require('../lib/integrator');
var assert = require('chai').assert;
var debug = require('debug')('bazaarbite');

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


    it('should get chat messages', function() {
	return integrator.getChatMessages({'guid': 'd47eea06209d3da8dc10937399a9cf1c3dd4dca4'})
	    .then(function(response) {
		debug('  - got response')
		debug(response)
		assert.isArray(response);
		assert.equal(response[0], 200, 'did not get HTTP code 200 back from OpenBazaar server.');
		debug('  - got messages');
		debug(response[1]);
	    })
    });

    
    it('should get chat conversations', function() {
	return integrator.getChatConversations({})
	    .then(function(response) {
		assert.isArray(response);
		assert.equal(response[0], 200, 'did not get HTTP code 200 back from OpenBazaar server.');
		assert.isArray(response[1]);
		assert.isObject(response[1][0]);

		var convo = response[1][0];
		assert.isString(convo['public_key']);
		assert.isString(convo.guid);
		assert.isString(convo.handle);
		assert.isString(convo['last_message']);
		assert.isNumber(convo.timestamp);
		assert.isString(convo['avatar_hash']);
		assert.isNumber(convo.unread);

		debug('  - got conversations');
		debug(response);
	    })
    });

    it('should get notifications', function() {
	return integrator.getNotifications({})
	    .then(function(response) {
		debug('  - got response');
		debug(response);
		assert.isArray(response);
		assert.equal(response[0], 200, 'did not get HTTP code 200 from OpenBazaar-Server');
		assert.isObject(response[1]);
		var notifs = response[1].notifications;
		debug(' - got notifs');
		debug(notifs);
		assert.isString(notifs[0].image_hash);
		assert.isBoolean(notifs[0].read);
		assert.isNumber(notifs[0].timestamp);
		assert.isString(notifs[0].type);
	    })
    });



});
