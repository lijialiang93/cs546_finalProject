let mongoose = require('../config/mongoConnection');
let bcrypt = require('bcryptjs');

//Profile Schema
let profileSchema = mongoose.Schema({
	name: {
		type: String
	},
	campusId: {
		type: String
	}
}, { _id: false });

//SingleQuizGradeGrade Schema
let singleGradeSchema = mongoose.Schema({
	quizId: {
		type: String
	},
	score: {
		type: Number
	}
}, { _id: false });

// User Schema
let userSchema = mongoose.Schema({
	_id: {
		type: String
	},
	role: {
		type: String
	},
	sessionId: {
		type: String
	},
	hashPassword: {
		type: String
	},
	profile: profileSchema,
	grades: [singleGradeSchema]
}, {
		versionKey: false
	});

let User = module.exports = mongoose.model('User', userSchema);

module.exports.createUser = function (newUser, callback) {
	bcrypt.genSalt(10, function (err, salt) {
		bcrypt.hash(newUser.hashPassword, salt, function (err, hash) {
			newUser.hashPassword = hash;
			newUser.save(callback);
		});
	});
}

module.exports.getUserByUsername = function (username, callback) {
	let query = { 'profile.name': username };
	User.findOne(query, callback);
}

module.exports.getUserById = function (_id, callback) {
	User.findById(_id, callback);
}

module.exports.getUserByName = function (name, callback) {
	User.getUserByUsername(name, function (err, newUser) {

	});
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
	bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
		if (err) throw err;
		callback(null, isMatch);
	});
}
module.exports.gradeQuiz = function (studentId,quizId,score, callback) {
	console.log(studentId);
	console.log(score);
    const updateCommand = {
        $set: { "grades.$.score": score}
    };
    const query = {
		_id: studentId,
		//tem quiz id
        "grades.quizId": 1,
	};
	
    User.updateOne(query,updateCommand,callback);
}