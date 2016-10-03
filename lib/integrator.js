/** integrator does the following:

    * gets all openbazaar items, stores in nedb
    *
*/

var Promise = require('bluebird');
var OpenBazaarAPI = require("insane-openbazaar-api");
var debug = require('debug')('ob-sidekick');


var username = process.env.OB_USERNAME;
var password = process.env.OB_PASSWORD;
var proto = process.env.OB_PROTO;
var host = process.env.OB_HOST;
var port = process.env.OB_PORT;
var ca = process.env.OB_CA;
if (typeof username === 'undefined')
    throw new Error('OB_USERNAME is not defined in environment');
if (typeof password === 'undefined')
    throw new Error('OB_PASSWORD is not defined in environment');
if (typeof proto === 'undefined')
    throw new Error('OB_PROTO is not defined in environment');
if (typeof host === 'undefined')
    throw new Error('OB_HOST is not defined in environment');
if (typeof port === 'undefined')
    throw new Error('OB_PORT is not defined in environment');
if (typeof ca === 'undefined')
    throw new Error('OB_CA is not defined in environment')


// create a new instance
var ob = new OpenBazaarAPI({
    "proto": proto,
    "host": host,
    "port": port,
    "ca": ca
});



var loggedIn = false;


module.exports.login = function login() {
    debug('logging in!');

    var loginAsync = Promise.promisify(
        ob.login, {
            context: ob,
            multiArgs: true
        }
    );


    return loginAsync({
            "username": username,
            "password": password
        })
        .catch(function(err) {
            throw err;
        });

}


module.exports.getListings = function getListings() {
  var getListingsAsync = Promise.promisify(
      ob.get_listings, {
          context: ob,
          multiArgs: true
      }
  );

  return getListingsAsync()
      .catch(function(err) {
          debug('there was an error but I\'m handling it');
          if (/login/.test(err)) {
              return login()
                  .then(getListingsAsync())
          }
          else {
              return err;
          }
      })
}


module.exports.getFollowers = function getFollowers(params) {
  var getFollowersAsync = Promise.promisify(
      ob.get_followers, {
          context: ob,
          multiArgs: true
      }
  );

  return getFollowersAsync(params);
}



module.exports.getChatMessages = function getChatMessages(params) {
    var getChatMessagesAsync = Promise.promisify(
	ob.get_chat_messages, {
	    context: ob,
	    multiArgs: true
	}
    );

    return getChatMessagesAsync(params);
}


module.exports.getChatConversations = function getChatConversations(params) {
    var getChatConversationsAsync = Promise.promisify(
	ob.get_chat_conversations, {
	    context: ob,
	    multiArgs: true
	}
    );
    return getChatConversationsAsync(params);
}

module.exports.getNotifications = function getNotifications(params) {
    var getNotificationsAsync = Promise.promisify(
	ob.get_notifications, {
	    context: ob,
	    multiArgs: true
	}
    );
    return getNotificationsAsync(params);
}

