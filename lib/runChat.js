var integrator = require('./integrator');
var debug = require('debug')('bazaarbite');
var assert = require('chai').assert;
var _ = require('lodash');
var Promise = require('bluebird');
var chat = require('./chat');
var DX = require('./dx');





// the conversation/message schema is as follows
//   * conversations are like a summary. they contain read/unread counts for individual messages, but they only contain the most recent message content.
//   * threads are arrays containing all the messages in a conversation
//   * messages are objects containing all message content




integrator.login()
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
		matches: chat.inspectMessage(msg.message)
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
	debug('  - final data!');
	debug(data);
	data[0][0].results.then(function(res) {
	    debug(res);
	});
    })


    .catch(function(err) {
	debug('  - got err');
	debug(err);
	if (err == 'no unread') {
	    console.log('no unreads. ending.');
	}
    })








