var chat = require('../lib/chat');
var assert = require('chai').assert;

describe('chat', function() {
    describe('inspectMessage', function() {
	it('should return false if no dx product url is found', function() {
	    var chatMessage = "I am just stopping by to say HI. LOL";
	    var inspected = chat.inspectMessage(chatMessage);
	    assert.isFalse(inspected);
	    assert.isNotNull(inspected);
	});
	
	it('should ignore whitespace after a dx product url', function() {
	    var chatMessage = "I'd like a DX pl0x. dx.com/p/zgpax-s22-sos-kid-s-gps-tracking-phone-tracking-online-watch-orange-444756#.V-GjI9Fb9pj how we proceed?"
	    var inspected = chat.inspectMessage(chatMessage);
	    assert.isArray(inspected);
	    assert.equal(inspected[0], 'dx.com/p/zgpax-s22-sos-kid-s-gps-tracking-phone-tracking-online-watch-orange-444756#.V-GjI9Fb9pj');
	});

	it('should get dx product url from chat message (variant 1)', function() {
	    var chatMessage = "Yes it's more than $10, but how about this : dx.com/p/jjrc-h31-waterproof-remote-control-drone-quadcopter-white-437995#.V6CZQYbSc_s"
	    var inspected = chat.inspectMessage(chatMessage);
	    assert.isArray(inspected);
	    assert.equal(inspected[0], 'dx.com/p/jjrc-h31-waterproof-remote-control-drone-quadcopter-white-437995#.V6CZQYbSc_s');
	})

	it('should get dx product url from chat message (variant 2)', function() {
	    var chatMessage = "How about this: dx.com/p/zgpax-s22-sos-kid-s-gps-tracking-phone-tracking-online-watch-orange-444756#.V-GjI9Fb9pj"
	    var inspected = chat.inspectMessage(chatMessage);
	    assert.isArray(inspected);
	    assert.equal(inspected[0], 'dx.com/p/zgpax-s22-sos-kid-s-gps-tracking-phone-tracking-online-watch-orange-444756#.V-GjI9Fb9pj');
	})

	it('should get dx product url from chat message that has www at the start', function() {
	    var chatMessage = "I WANT TO BUY www.dx.com/p/zgpax-s22-sos-kid-s-gps-tracking-phone-tracking-online-watch-orange-444756#.V-GjI9Fb9pj"
	    var inspected = chat.inspectMessage(chatMessage);
	    assert.isArray(inspected);
	    assert.equal(inspected[0], 'dx.com/p/zgpax-s22-sos-kid-s-gps-tracking-phone-tracking-online-watch-orange-444756#.V-GjI9Fb9pj');
	})

	it('should get dx product url from chat message that has http://www at the start', function() {
	    var chatMessage = "pelease http://www.dx.com/p/zgpax-s22-sos-kid-s-gps-tracking-phone-tracking-online-watch-orange-444756#.V-GjI9Fb9pj"
	    var inspected = chat.inspectMessage(chatMessage);
	    assert.isArray(inspected);
	    assert.equal(inspected[0], 'dx.com/p/zgpax-s22-sos-kid-s-gps-tracking-phone-tracking-online-watch-orange-444756#.V-GjI9Fb9pj');
	})

	it('should get dx product url from chat message that has https://www at the start', function() {
	    var chatMessage = "i would like this-- https://www.dx.com/p/zgpax-s22-sos-kid-s-gps-tracking-phone-tracking-online-watch-orange-444756#.V-GjI9Fb9pj thanks!"
	    var inspected = chat.inspectMessage(chatMessage);
	    assert.isArray(inspected);
	    assert.equal(inspected[0], 'dx.com/p/zgpax-s22-sos-kid-s-gps-tracking-phone-tracking-online-watch-orange-444756#.V-GjI9Fb9pj');
	})

	it('should get a dx product url from an eud.dx.com url', function() {
            var chatMessage = "can I order this: eud.dx.com/product/bstuo-spdif-toslink-3-in-1-out-ir-splitter-switcher-black-844445642 ?"
	    var inspected = chat.inspectMessage(chatMessage);
	    assert.isArray(inspected);
	    assert.equal(inspected[0], 'dx.com/product/bstuo-spdif-toslink-3-in-1-out-ir-splitter-switcher-black-844445642');
	})
    });
});
