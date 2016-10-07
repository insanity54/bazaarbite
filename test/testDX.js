var assert = require('chai').assert;
var DX = require('../lib/dx');
var debug = require('debug')('bazaarbite');
var Table = require('cli-table2');


var tableOpts = {
    head: [
	'Title',
	'Description',
	'Specifications',
	'DX price',
	'list price',
	'S-A-B price',
	'Currency',
	'Pictures'
    ],
    colWidths: [40, 30, 30, 10, 15, 15, 10, 50]
};
    


describe('DX', function() {
    
    describe('getListing', function() {

        it('should accept a {string} dx.com url and return an {object} continging the title, description, pictures, and prices.', function() {
	    this.timeout(10000);
	    
	    var dx = new DX();
	    return dx.getListing('http://www.dx.com/p/itead-wi-fi-app-control-e27-screw-base-433-remote-control-white-441174#.V_EolLVb9pg')
		.then(function(data) {
		    debug(data);
		    assert.isObject(data);
		    assert.isString(data.title);
		    assert.isString(data.description);
		    assert.isString(data.specifications);
		    assert.isObject(data.price);
		    assert.isNumber(data.price.original);
		    assert.isString(data.price.originalStr);
		    assert.isNumber(data.price.list);
		    assert.isString(data.price.listStr);
		    assert.isNumber(data.price.markedUp);
		    assert.isString(data.price.markedUpStr);
		    assert.isString(data.price.currency);
		    assert.isObject(data.pictures);
		    assert.isArray(data.pictures.urls);
		    assert.isArray(data.pictures.b64s);


		    var table = new Table(tableOpts);
		    
		    
		    table.push([
			data.title,
			data.description.trim().replace('\r\n','').substring(0,50)+'(...)',
			data.specifications.trim().replace('\r\n','').substring(0,50)+'(...)',
			data.price.originalStr,
			data.price.listStr,
			data.price.markedUpStr,
			data.price.currency,
			data.pictures.urls.join('\n')
		    ]);
		    
		    //debug(table)
		    console.log(table.toString());
		    
		});
	});
	
	
	
	it('should gracefully deal with a URL without www or http at the start', function() {

	    this.timeout(10000);
	    
	    var dx = new DX();
	    return dx.getListing('dx.com/p/usb-charging-data-cable-for-samsung-galasy-s-iii-i9300-more-black-91cm-135426')
		.then(function(data) {
		    debug(data);
		    assert.isObject(data);
		    assert.isString(data.title);
		    assert.isString(data.description);
		    assert.isString(data.specifications);
		    assert.isObject(data.price);
		    assert.isNumber(data.price.original);
		    assert.isString(data.price.originalStr);
		    assert.isNumber(data.price.list);
		    assert.isString(data.price.listStr);
		    assert.isNumber(data.price.markedUp);
		    assert.isString(data.price.markedUpStr);
		    assert.isString(data.price.currency);
		    assert.isObject(data.pictures);
		    assert.isArray(data.pictures.urls);
		    assert.isArray(data.pictures.b64s);
		})
	});
    });



    describe('getListings', function() {
	it('should accept an array of strings containing multiple dx item urls and return an array containing multiple dx listing object', function() {
	    this.timeout(30000);

	    var table = new Table(tableOpts);

	    var dx = new DX();
	    return dx.getListings([
		'http://www.dx.com/p/itead-wi-fi-app-control-e27-screw-base-433-remote-control-white-441174#.V_EolLVb9pg',
		'http://www.dx.com/p/zgpax-s22-sos-kid-s-gps-tracking-phone-tracking-online-watch-orange-444756#.V-GjI9Fb9pj',
		'http://www.dx.com/p/3-5mm-audio-jack-male-to-rca-audio-converter-30cm-5143'
	    ])
		.then(function(listings) {
		    assert.isArray(listings);
		    debug(listings);
		    assert.isObject(listings[0]);
		    return listings;
		})

		.mapSeries(function(data) {
		    // to through each listing data
		    assert.isString(data.title);
		    assert.isString(data.description);
		    assert.isString(data.specifications);
		    assert.isObject(data.price);
		    assert.isNumber(data.price.original);
		    assert.isString(data.price.originalStr);
		    assert.isNumber(data.price.list);
		    assert.isString(data.price.listStr);
		    assert.isNumber(data.price.markedUp);
		    assert.isString(data.price.markedUpStr);
		    assert.isString(data.price.currency);
		    assert.isObject(data.pictures);
		    assert.isArray(data.pictures.urls);
		    assert.isArray(data.pictures.b64s);

		    table.push([
			data.title,
			data.description.trim().replace('\r\n','').substring(0,50)+'(...)',
			data.specifications.trim().replace('\r\n','').substring(0,50)+'(...)',
			data.price.originalStr,
			data.price.listStr,
			data.price.markedUpStr,
			data.price.currency,
			data.pictures.urls.join('\n')
		    ]);
		})
		.then(function() {
		    //debug(table)
		    console.log(table.toString());
		});
	});
    });

    describe('getPicture', function() {
	it('should add http to a url without', function() {
	    var dx = new DX();
	    return dx.getPicture('//img.dxcdn.com/productimages/sku_5143_3.jpg')
		.then(function(data) {
		    var b64regex = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
		    var isValid = b64regex.test(data);
		    assert.isTrue(isValid);
		})
	});
	it('should accept a url to a picture, download the picture, and return {string} b64', function() {
	    var dx = new DX();
	    return dx.getPicture('http://img.dxcdn.com/productimages/sku_444756_3.jpg')
		.then(function(data) {
		    var b64regex = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
		    var isValid = b64regex.test(data);
		    assert.isTrue(isValid);
		});
	});
    });

});
