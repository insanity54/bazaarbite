var debug = require('debug')('bazaarbite');
var Promise = require('bluebird');
var integrator = require('./integrator');
var debug = require('debug')('bazaarbite');
var assert = require('chai').assert;
var _ = require('lodash');
var Promise = require('bluebird');
var DX = require('./dx');
var datastore = require('nedb-promise');
var moment = require('moment');

var db = datastore({autoload: true});





module.exports.inspectMessage = function inspectMessage(message) {
    var dxUrlRegex = /(?:dx|dealextreme)\.com\/(?:p|product)\/[\S]+/g;

    debug('  inspecting message');
    debug(message);
	
    var found = message.match(dxUrlRegex);
    debug('  - got regex matches');
    debug(found);
    
    if (found === null) return false;
    return found;
}











/**
 * listProductsFoundInChats2
 *
 *   * connects to the OpenBazaar-Server
 *   * gets unread messages containing 'dx.com/p/...' urls
 *   * scrapes the dx.com/p/.. page and gets the product information
 *   * creates listing in OpenBazaar for each product
 *   * replies to original messags with the link to the ob:// listing
 *
 * cleaner implementation with data offloaded to db
 */
module.exports.listProductsFoundInChats2 = function listProductsFoundInChats2() {
    var self = this;
    
    return integrator.login()
	.then(function() {
	    return integrator.login()
	})
	.then(function(response) {
	    assert.equal(response[0], 200, 'did not get HTTP code 200 from OpenBazaar-Server');
	    return response[1];
	})
	.then(function(conversations) {
	    // get unread msgs
	    return _.chain(conversations)
		.filter(function(c) {
		    return c['unread'] > 0
		})
		.sortBy('timestamp')
		.value();
	})
	.then(function(unreads) {
	    assert.isArray(unreads);
	    if (unreads.length < 1) {
		console.log('no unread messages');
		return Promise.reject('no unread');
	    }
	    else {
		debug('all the unreads--');
		debug(unreads);
		return unreads;
	    }
	})

	.map(function(convo) {
	    // get message thread from conversation
	    return integrator.getChatMessages({'guid': convo.guid})
	})

        

    
}


module.exports.listProductsFoundInChats = function listProductsFoundInChats() {
    var self = this;
    // the conversation/message schema is as follows
    //   * conversations are like a summary. they contain read/unread counts for individual messages, but they only contain the most recent message content.
    //   * threads are arrays containing all the messages in a conversation
    //   * messages are objects containing all message content
    
    
    return integrator.login()
	.then(function() {
	    return integrator.getChatConversations()
	})
	.then(function(response) {
	    assert.equal(response[0], 200, 'did not get HTTP code 200 from OpenBazaar-Server!');
	    return response[1];
	})
	.then(function(conversations) {
	    // get unread messages
	    debug('  - got convos');
	    debug(conversations);
	    return _.chain(conversations)
		.filter(function(c) {
		    return c['unread'] > 0
		})
		.sortBy('timestamp')
		.value();
	})
	.then(function(unreads) {
	    assert.isArray(unreads);
	    debug('  - got unreads');
	    debug(unreads)
	    if (unreads.length < 1) {
		console.log('no unread messages');
		return Promise.reject('no unread');
	    }
	    else {
		console.log('all the unreads--');
		console.log(unreads);
		return unreads;
	    }
	})
	.map(function(convo) {
	    // get message thread from conversation
	    return integrator.getChatMessages({'guid': convo.guid})
		.then(function(response) {
		    // take getChatMessages response and return messages array
		    assert.equal(response[0], 200, 'there was a problem getting chat messages');
		    return response[1];
		});
	})
	.map(function(thread) {
	    // got message thread
	    // return the unread messages within
	    debug('mapping thread');
	    debug(thread);
	    
	    return _.chain(thread)
		.filter(['read', false])      // only unread
		.filter(['outgoing', false])  // only incoming
		.value()
	})

	.map(function(threads) {
	    // run each message through the inspector function
	    // create a new array which retains context and adds dx url matches
	    // and filter out any messages with no dx.com url matches
	    
	    return _.chain(threads).map(function(msg) {
		return {
		    context: msg,
		    matches: self.inspectMessage(msg.message)
		};
	    }).filter(function(msg) {
		// filter out non-matching messages
		return msg.matches !== false;
	    }).value();

	})


	.then(function(data) {
	    // receives array of arrays.
	    //
	    // [ 
	    //   [   // contains all unread messages from customer A
	    //     {
	    //       context: [object], // the original openbazaar message
	    //       matches: [array]   // {string} dx.com product urls which were found in the chat message
            //     },
	    //     {
	    //       context: [object],
	    //       matches: [array]
	    //     }
            //   ],
	    //   [  // contains all unread messages from customer B
	    //     {
	    //       context: [object],
	    //       matches: [array]
	    //     }
	    //   ]
	    // ]
	    //     
	    // remove non-matching datums
	    debug('got data');
	    debug(data);
	    return data;
	})

	.map(function(datum) {
	    /**
	     * // this is probably incorrectly formatted jsdoc
             * {array} datum
             *
	     * @property {unreadMessage}
             */

	    /**
	     * Typedef unreadMessage
	     *
             * @property {object} context
	     * @property {string} context.message
	     * @property {array} matches
	     */

	    // using matches, get dx objects
	    // datum is the unread messages array from ONE customer.
	    //   datum may or may not contain multiple unread message objects


	    // iterate through each of this customer's unread message objects
	    // for each, return a DX listing object
	    var dx = new DX();
	    return new Promise.map(datum, function(unreadMessage) {
		debug('  - mapping unreadMessage');
		debug(unreadMessage);

		unreadMessage['results'] = dx.getListings(unreadMessage.matches);
		return unreadMessage;
	    })
	})

	.then(function(data) {
	    debug('  - dx data!');
	    debug(data);
	    return data;
	})

        // iterate the customers
        .map(function(data) {

	    // iterate the customer data
	    return new Promise.map(data, function(datum) {
		// upload DX product images to OpenBazaar-Server
		debug('  - uploading DX product images');

		// iterate dealextreme product objects
		return new Promise.map(datum.results, function(dxObj) {

		    debug(dxObj);
		    // iterate product images
		    // for each image
		    //   upload it's b64 to OB-Server
		    //   save the hash granted by OB-Server
		    
		    
		    datum['OBImageHashes'] = new Promise.map(dxObj.pictures.b64s, function(picB64) {
			debug('  - uploading image. b64 MUST be a string at this point');
			debug(picB64);
			return integrator.uploadImage({image: picB64})
			    .then(function(response) {
				assert.equal(200, response[0]);
				assert.isObject(response[1]);
				assert.isArray(response[1].image_hashes);
				debug('  - uploaded image.');
				debug(response[1].image_hashes);
				return response[1].image_hashes[0];
			    })
		    })

		    datum['OBListings'] = new Promise.map(datum['results'], function(r) {

			var expirationDate = moment().utc().add(2,'months').format('YYYY-MM-DDTHH:mm');
			Promise.props({
			    'expiration_date': expirationDate,
			    'keywords': ['dealextreme', 'dx', 'cheap', 'inexpensive', 'china', 'chinese'], // @todo pull keywords from listing
			    'metadata_category': 'physical good',
			    'category': 'China Direct',
			    'title': r.title,
			    'description': r.description,
			    'condition': 'new',
			    'sku': '',
			    'images': datum['OBImageHashes'],
			    'currency_code': 'USD',
			    'price': r.price.markedUpStr,
			    'process_time': '1 day',
			    'nsfw': false,
			    'shipping_origin': 'CHINA',
			    'ships_to': ['ALL'],
			    'est_delivery_domestic': '7-21 Business Days',
			    'est_delivery_international': '7-21 Business Days',
			    'returns': 'Returns are accepted should your product be incorrect or faulty. You pay return shipping.',
			    'terms_conditions': 'Item will be drop shipped to you from DX.com in China. Shipping normally takes 2+ weeks. I will provide you a tracking number as soon as it is available.',
			    'shipping_currency_code': 'USD',
			    'shipping_domestic': 0,
			    'shipping_international': 0,
			    'free_shipping': true
			})
			    .then(function(contractOpts) {
				debug('  - creatin contract');
				debug(contractOpts.images);
				

				return integrator.createContract(contractOpts)
				    .then(function(res) {
					assert.equal(res[0], 200);
					assert.isObject(res[1]);
					assert.isTrue(res[1].success)
					debug('  - created listing');
					debug(res[1]);
				    })
			    })
		    })
		    return datum;
		})
	    })
	})


	.map(function(data) {
	    // debug
	    debug('  - got something hopefully interesting');
	    debug(data);
	    data[0][0].OBImageHashes.then(function(hashes) {
		debug(hashes);
	    })
	    return data;
	})

        
	.catch(function(err) {
	    debug('  - got err');
	    debug(err);
	    if (err == 'no unread') {
		console.log('no unreads. ending.');
	    }
	})

}



//module.exports.






