let mongo = require('mongodb');
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test_system');
let db = mongoose.connection;

module.exports = mongoose;