const mongoose = require('mongoose');

const libs = process.cwd() + '/libs/';

const log = require(libs + 'log')(module);
const config = require(libs + 'config');
const opts = { useMongoClient: true };
mongoose.connect(config.get('mongoose:uri'), opts);

let db = mongoose.connection;

db.on('error', function (err) {
	log.error('Connection error:', err.message);
});

db.once('open', function callback () {
	log.info("Connected to DB!");
});

module.exports = mongoose;