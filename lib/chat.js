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

    debug('  - inspecting message');
    debug(message);
	
    var found = message.match(dxUrlRegex);
    debug('  - got regex matches');
    debug(found);
    
    if (found === null) return false;
    return found;
}




/**
 * uploadOBImage
 *
 * accepts base64 encoded image
 * returns image hash
 */
module.exports.createOBImage = function createOBImage(imageB64) {
    return integrator.uploadImage({image: imageB64})
	.then(function(response) {
	    assert.equal(200, response[0], 'did not get an OK response when uploading OB image');
	    assert.isObject(response[1], 'did not get response data when uploading OB image');
	    assert.isArray(response[1].image_hashes, 'did not get image hashes when uploading OB image');
	    debug('  - uploaded image.');
	    debug(response[1].image_hashes);
	    return response[1].image_hashes[0];
	})
}




module.exports.createOBContract = function createOBContract(options) {


    var defaultOptions = {
	expirationDate: moment().utc().add(2,'months').format('YYYY-MM-DDTHH:mm'),
	keywords: ['dealextreme', 'dx', 'cheap', 'inexpensive', 'china', 'chinese'], // @todo pull keywords from listing
	metadata_category: 'physical good',
	category: 'China Direct',
	title: 'Special Item',
	description: 'A really good item just for youuuuuuu!',
	condition: 'new',
	sku: '',
	currency_code: 'USD',
	price: '12.34',
	process_time: '1 day',
	nsfw: false,
	shipping_origin: 'CHINA',
	ships_to: ['ALL'],
	est_delivery_domestic: '7-21 Business Days',
	est_delivery_international: '7-21 Business Days',
	returns: 'Please do if there is a problem.',
	terms_conditions: '',
	shipping_currency_code: 'USD',
	shipping_domestic: 0,
	shipping_international: 0,
	free_shipping: true
    };

    var opts = _.defaults(options, defaultOptions, {});

    assert.isArray(opts.images, 'options.images was not an array of hashes as expected');
    
    

    
    // create listing
    Promise.props({
	'expiration_date': opts.expirationDate,
	'keywords': opts.keywords,
	'metadata_category': opts.metadata_category,
	'category': opts.category,
	'title': opts.title,
	'description': opts.description,
	'condition': opts.condition,
	'sku': opts.sku,
	'images': opts.images,
	'currency_code': opts.currency_code,
	'price': opts.price,
	'process_time': opts.process_time,
	'nsfw': opts.nsfw,
	'shipping_origin': opts.shipping_origin,
	'ships_to': opts.ships_to,
	'est_delivery_domestic': opts.est_delivery_domestic,
	'est_delivery_international': opts.delivery_international,
	'returns': opts.returns,
	'terms_conditions': opts.terms_conditions,
	'shipping_currency_code': opts.shipping_currency_code,
	'shipping_domestic': opts.shipping_domestic,
	'shipping_international': opts.shipping_international,
	'free_shipping': opts.free_shipping
    })
	.then(function(contractOpts) {
	    debug('  - creatin contract');
	    debug(contractOpts);
	    
	    
	    return integrator.createContract(contractOpts)
		.then(function(res) {
		    assert.equal(res[0], 200);
		    assert.isObject(res[1]);
		    assert.isTrue(res[1].success)
		    debug('  - created listing');
		    debug(res[1]);
		})
	})
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



/**
 * create a contract in OpenBazaar
 *
 * @todo move to integrator module
 *
 *
 */
module.exports.createContract = function createContract(options) {


    var opts = _.defaults(options, defaultOptions, {})

    datum['OBImageHashes'] = new Promise.map(dxObj.pictures.b64s, function(picB64) {
	debug('  - uploading image. b64 MUST be a string at this point');
	debug(picB64.substring(0,50)+'...');
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


}



module.exports.createListingFromCLI = function createListingFromCLI() {
    var self = this;
    var inputString = process.argv[2];
    
    assert.isString(inputString, 'did not receive string containing DX product links!');

    return integrator.login()
	.then(function() {
	    // using string passed via CLI, get dx product links
	    var dxLinks = self.inspectMessage(inputString);
	    assert.isAbove(dxLinks.length, 0, 'no dx links were found in the string passed via CLI');
	    
    	    var dx = new DX();
	    var dxObjects = new Promise.map(dxLinks, function(link) { return dx.getListing(link) });


	    var hashes = dxObjects.map(function(dxO) {

		// for each b64 image, upload to openbazaar
		// return an array of image hashes

		var b64s = dxO.pictures.b64s;
		return new Promise.map(b64s, function(b) {
		    return self.createOBImage(b)
		}) // => [ 'aisd', 'ijgi', '3iaf' ]		

	    }) // => [ ['aisd', 'ijgi', '3iaf'], ['ppdd', 'radj', llbt'] ]

	    
	    // 
	    // {
	    //   dxObjects: { ... },
	    //   imageHashes: [ ... ]
	    // }
	    //

	    return Promise.props({ 
		'dxObjects': dxObjects,
		'imageHashes': hashes
	    });


	})

	.then(function(res) {
	    debug('  - got res');
	    debug(res);
	    return res;
	})

	.then(function(res) {
	    // create OB listings
	    
	    assert.isArray(res.dxObjects);
	    assert.isArray(res.imageHashes);

	    var obListings = new Promise.map(res.dxObjects, function(dxO, index) {

		assert.isString(dxO.title);
		assert.isString(dxO.description);
		assert.isString(dxO.specifications);
		assert.isObject(dxO.price);
		assert.isString(dxO.price.markedUpStr);
		assert.isObject(dxO.pictures);
		
		debug('  - price');
		debug(dxO.price);
		
		var listingOptions = {
		    title: dxO.title,
		    description: dxO.description,
		    images: res.imageHashes[index],
		    price: dxO.price.markedUpStr,
		    shipping_origin: 'CHINA',
		    ships_to: ['ALL'],
		    est_delivery_domestic: '7-21 Business Days',
		    est_delivery_international: '7-21 Business Days',
		    returns: 'Returns are accepted should your product be incorrect of faulty. You pay return shipping.',
		    terms_conditions: 'Item will be drop shipped to you from DX.com in China. Shipping normally takes 2+ weeks. I will provide you a tracking number as soon as it becomes available.',
		    shipping_domestic: 0,
		    shipping_international: 0,
		    free_shipping: true
		};

		
		return self.createOBContract(listingOptions);
	    });
	    
	    return new Promise.props({
		obListings: res.obListings,
		dxObjects: res.dxObjects,
		imageHashes: res.imageHashes
	    })

	})

	.then(function(res) {
	    debug('  - got final res');
	    debug(res);
	});
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
		// .filter(function(c) {
		//     return c['unread'] > 0
		// })
	        .filter(function(c) {
		    debug(moment(c['timestamp'], 'X'))
		    return moment(c['timestamp'], 'X').isAfter(moment().subtract(3, 'days')) // nothing older than 3 days
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

		    // iterate product images
		    // for each image
		    //   upload it's b64 to OB-Server
		    //   save the hash granted by OB-Server
		    
		    
		    datum['OBImageHashes'] = new Promise.map(dxObj.pictures.b64s, function(picB64) {
			debug('  - uploading image. b64 MUST be a string at this point');
			debug(picB64.substring(0,50)+'...');
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

        .each(function(data) {
	    // reply to messages
	    // @TODO
	    // @TODO
	    // @TODO
	    debug('  - replying to messages');

	    // iterate customer objects
	    return new Promise.each(data, function(datum) {

		// iterate messages
		return new Promise.each(datum, function(msgObject) {
		    debug(msgObject);
		    //chat.
		})
	    });

	    return data;

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










