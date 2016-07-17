var CronJob = require('cron').CronJob;
var integrator = require('./lib/integrator');
var nedb = require('nedb');
var debug = require('debug')('ob-sidekick');
var faker = require('faker');


new CronJob('*/3 * * * * *', function() {
  console.log('You will see this message every few minutes, %s', faker.name.findName());

  integrator.getListings()
    .then(function(reply) {
        debug('all good in the hood');
        debug(reply)
    })
    .catch(function(err) {
        debug('problum.');
        debug(err);
    });

}, null, true, 'America/Los_Angeles');
