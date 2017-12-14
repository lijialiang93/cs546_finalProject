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


//async function
module.exports.pushNewGrade = function (studentId, grade, callback) {
	User.update(
		(
			{
				_id: studentId,
			}

		), { $push: { grades: grade } }
		, callback);
}

module.exports.getStudentById = async function (_id) {
	try {
		return await User.findById(_id);
	} catch (error) {
		console.log(error);
	}

}

module.exports.getScoreByStudentIdAndQuizId = async function (studentId, quizId) {
	try {
		let grade = await User.findOne({
			"_id": studentId,
			"grades.quizId": quizId
		},
			{
				grades: { $elemMatch: { quizId: quizId } },
				"grades.score": 1
			});
		if (grade !== null) {
			return grade.grades[0].score;
		}
		else {
			return null;
		}

	} catch (error) {
		console.log(error);
	}
}

module.exports.gradeQuiz = async function (studentId, quizId, score) {
	const updateCommand = {
		$set: { "grades.$.score": score }
	};
	const query = {
		_id: studentId,
		"grades.quizId": quizId
	};

	await User.updateOne(query, updateCommand);
}