var assert = require('chai').assert;
var DX = require('../lib/dx');
var debug = require('debug')('bazaarbite');


describe('DX', function() {
    it('should get the title, description, pictures, and price given a url to a dealextreme listing', function() {
	this.timeout(10000);

	var dx = new DX();
	return dx.getListing('http://www.dx.com/p/1a-2-1a-dual-usb-car-cigarette-lighter-charger-black-12v-224300')
	    .then(function(data) {
		debug(data);
		assert.isObject(data);
		assert.isString(data.title);
		assert.isString(data.description);
		assert.isObject(data.price);
		assert.isNumber(data.price.original);
		assert.isString(data.price.originalStr);
		assert.isNumber(data.price.list);
		assert.isString(data.price.listStr);
		assert.isNumber(data.price.markedUp);
		assert.isString(data.price.markedUpStr);
	    });
    });
});
