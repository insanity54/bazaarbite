var debug = require('debug')('bazaarbite');
var Promise = require('bluebird');


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







