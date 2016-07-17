// randomly chooses a follower for the @saveabit weekly giveaway

var integrator = require('./integrator');
var debug = require('debug')('ob-sidekick');
var assert = require('chai').assert;

var rando = function randomIntFromInterval(min, max) {
    // greets https://stackoverflow.com/a/7228322/1004931
    return Math.floor(Math.random() * (max - min + 1) + min);
}

console.log('And the winner is...');

var announceWinner = function announceWinner(winnerObject) {
    console.log('"%s"! Congrats.', winnerObject.name);
    console.log(winnerObject);
};

integrator.login()
    .then(function() {
        return integrator.getFollowers()
            .then(function(reply) {
                debug(reply);
                assert.isNumber(reply[1].count);
                assert.isArray(reply[1].followers);
                var winningNumber = rando(1, reply[1].count);
                var winnerObject = {};
                debug('winning number is ' + winningNumber);
                // another call to getFollowers needs to be made
                // with 'start' param, if the winning number is greater than
                // the list that ob-server sent us (30 items)
                if (winningNumber > reply[1].followers.length) {
                    integrator.getFollowers({
                            'start': winningNumber
                        })
                        .then(function(reply) {
                            debug(reply);
                            assert.isNumber(reply[1].count);
                            assert.isArray(reply[1].followers);
                            winnerObject = reply[1].followers[0];
                            announceWinner(winnerObject);
                        })
                        .catch(function(err) {
                            throw err;
                        });
                } else {
                    winnerObject = reply[1].followers[(winningNumber-1)];
                    announceWinner(winnerObject);
                }
            })
            .catch(function(err) {
                throw err;
            });
    });
