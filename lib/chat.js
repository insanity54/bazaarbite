var integrator = require('./integrator');
var debug = require('debug')('bazaarbite');
var assert = require('chai').assert;
var _ = require('lodash');



integrator.login()
    .then(function() {
	return integrator.getChatConversations()
    })
    .then(function(response) {
	assert.equal(response[0], 200, 'did not get HTTP code 200 from OpenBazaar-Server!');
	return response[1];
    })
    .then(function(conversations) {
	debug('  - got convos');
	debug(conversations);
	return _.chain(conversations)
	    .filter(['unread', 1])
	    .sortBy('timestamp')
	    .value();
    })
    .then(function(unreads) {
	assert.isArray(unreads);
	debug('  - got unreads');
	debug(unreads)
	if (unreads.length < 1) 
	    console.log('no unread messages');
	else {
	    console.log('all the unreads--');
	    console.log(unreads);
	}
    })


