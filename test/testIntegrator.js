var Promise = require('bluebird');
var integrator = require('../lib/integrator');
var assert = require('chai').assert;
var debug = require('debug')('bazaarbite');
var fs = require('fs');
var path = require('path');
var moment = require('moment');




var firstFollower = {};

describe('integrator', function() {

    this.timeout(10000);

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
		debug(reply[1].listings);
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

    it('should mark chat message as read', function() {
	return integrator.markChatMessageAsRead({guid: 'abceea06209d3da8dc10937399a9cf1cidjfe843'})
	    .then(function(response) {
		debug(response);
		assert.isArray(response);
		assert.equal(response[0], 200);
		assert.equal(response[1].success, true);
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

    it('should get a contract', function() {
	return integrator.getContracts({id: '63f482a641794931f8ee7b1e290f1a3170cce6c5'})
	    .then(function(response) {
		debug('got contract');
		debug(response);
		assert.equal(response[0], 200, 'did not get HTTP code 200 from OpenBazaar-Server');
		assert.isObject(response[1]);
	    })
    });

    it('should create a contract', function() {
	var expirationDate = moment().utc().add(5,'minutes').format('YYYY-MM-DDTHH:mm');
	var contractOpts = {
	    'expiration_date': expirationDate,
	    'keywords': ['test', 'item', 'bazaar', 'market'],
	    'metadata_category': 'physical good',
	    'category': 'China Direct',
	    'title': 'bazaarbite test item',
	    'description': 'bazaarbite test. Expires '+expirationDate,
	    'currency_code': 'USD',
	    'price': 100,
	    'process_time': '1 day',
	    'nsfw': false,
	    'shipping_origin': 'UNITED_STATES',
	    'ships_to': ['ALL'],
	    'est_delivery_domestic': '1-5 millenia',
	    'est_delivery_international': '3-8 millenia',
	    'terms_conditions': 'I will give you a high five instead of sending you this item',
	    'returns': 'You may return the high five at any time of my choosing',
	    'shipping_currency_code': 'USD',
	    'shipping_domestic': 5,
	    'shipping_international': 10,
	    'condition': 'new',
	    'sku': 'test',
	    'images': ['88624d3bdb93776ebefcf82ddb6f57e3d71df431'],
	    'free_shipping': false,
	    
	};
	return integrator.createContract(contractOpts)
	    .then(function(response) {
		debug('  - created contract')
		debug(response)
		assert.equal(response[0], 200);
		assert.isObject(response[1]);
		assert.isTrue(response[1].success);
	    });
    });



    it('should upload an image', function() {
	this.timeout(15000);
	var testImg = fs.readFileSync(path.join(__dirname, '..', 'blobs', 'testimage.png.b64'));
	return integrator.uploadImage({image: testImg})
	    .then(function(response) {
		debug('  - image uploaded');
		debug(response);
	    });
    });



});
