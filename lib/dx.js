var cheerio = require('cheerio');
var rp = require('request-promise');
var assert = require('chai').assert;
var _ = require('lodash');
var debug = require('debug')('bazaarbite');




var DX = function DX(options) {
    var defaults = {
	markup: 1.03,        // 30%  (in decimal)
	maximumPrice: 100000 // $100 (in pennies)
    };
    var opts = _.defaults(options, defaults)
    this.markup = opts.markup;
    this.maximumPrice = opts.maximumPrice;
};


DX.prototype.getListing = function getListing(listingURL) {
    var self = this;
    
    var listingPageOpts = {
	url: listingURL,
	transform: function(body) {
	    return cheerio.load(body);
	}
    };

    return rp.get(listingPageOpts)
        .then(function($) {
	    debug('  - downloaded page body');
	    debug($);
	    debug('  - interesting thing');
	    debug($('div.container.full_screen div.wrapper div.pdetail_wrapper div.clearfix div.pinfo_wrapper div.review_sku.clearfix'));
	    
	    var data = {};
	    data.title = '';
	    data.description = '';
	    data.specifications = '';
	    data.price = {};
	    data.price.currency = '';
	    data.price.listStr = '';
	    data.price.list = 0;
	    data.price.originalStr = '';
	    data.price.original = 0;
	    data.price.markedUpStr = '';
	    data.price.markedUp = 0;
	    

	    // get title from page
	    data.title = $('span#headline').text();

	    // get description from page
	    data.description = $('div#overview-detailinfo.infoContainer').text();

	    // get specifications from page
	    data.specifications = $('div#specification-detailinfo.infoContainer').text();

	    // get currency from page
	    data.price.currency = $('div#price-selector.cybox.dropdown a#currencySymbol.cy.hover span.cur_cy').text();

	    // get list price from page
	    data.price.listStr = $('del#list-price.fl').text().replace('US$', '');
	    data.price.list = (parseFloat(data.price.listStr) / 0.01); // list price in pennies

	    // get original price from page
	    data.price.originalStr = $('span#price.fl').text();
	    data.price.original = (parseFloat(data.price.originalStr) / 0.01); // original price in pennies

	    // calculate save-a-bit marked up price
	    data.price.markedUp = Math.round(data.price.original * self.markup);
	    data.price.markedUpStr = (data.price.markedUp * 0.01).toFixed(2);

	    
	    // make sure the values found were sensible
	    var dollarRegex = /^\d{1,}\.\d{2}$/;
	    assert.isAbove(data.title.length, 5, 'the title was not more than 5 characters! This doesn\'t seem right.');
	    assert.isAbove(data.description.length, 25, 'the description was not more than 25 characters! This doesn\'t seem right.');
	    assert.isAbove(data.specifications.length, 10, 'the specifications were not more than 10 characters! This doesn\'t seem right.');
	    assert.equal(data.price.currency, 'US$', 'the currency was not dollars.');

	    assert.match(data.price.listStr, dollarRegex, 'the list price string was not in DD.CC format!');
	    assert.isAbove(data.price.list, 0, 'the list price was not above zero!');

	    assert.match(data.price.originalStr, dollarRegex, 'the original price was not in DD.CC format!');
	    assert.isAbove(data.price.original, 0, 'the original price was not above zero!');
	    assert.isBelow(data.price.original, self.maximumPrice, 'this item cost too much! maximum price is '+self.maximumPrice+' pennies.');

	    assert.match(data.price.markedUpStr, dollarRegex, 'the marked up price was not in DD.CC format!');
	    assert.isAbove(data.price.markedUp, 0, 'the markedup price was not above zero!');
	    

	    return data;
	});
    
}


module.exports = DX;

