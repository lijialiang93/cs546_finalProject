let express = require('express');
let router = express.Router();
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let User = require('../models/user');
let Quiz = require('../models/quiz');
let Submission = require('../models/submissions');

router.get('/', function (req, res) {
	if (!req.user) { res.render('login'); }
	else if (req.user.role === "student") { res.render('dashboard', { Student: true }); }
	else if (req.user.role === "teacher") { res.render('dashboard', { Teacher: true }); }
});

router.get('/login', ensureAuthenticated, function (req, res) {
	res.redirect('/');
});

router.get('/dashboard', ensureAuthenticated, function (req, res) {
	if (req.user.role === "student") { res.render('dashboard', { Student: true }); }
	else if (req.user.role === "teacher") { res.render('dashboard', { Teacher: true }); }
});

router.get('/information', ensureAuthenticated, function (req, res) {
	if (req.user.role === "student") { res.render('information', { Student: true }); }
	else if (req.user.role === "teacher") { res.render('information', { Teacher: true }); }
});

router.get('/takeQuiz', ensureAuthenticated, function (req, res) {
	let url = require('url');
	let url_parts = url.parse(req.url, true);
	let query = url_parts.query;
	Quiz.findById(req.query.quizId, function (err, quiz) {
		if (err) {
			console.log(err);
		}
		else {
			console.log(quiz);
			res.render('takeQuiz', {
				quiz: quiz
			});
		}
	})

});

router.get('/exam', ensureAuthenticated, function (req, res) {
	Quiz.find({}, function (err, quizList) {
		if (err) {
			console.log(err);
		}
		else {
			if (req.user.role === "student") {
				res.render('exam', {
					quizList: quizList,
					Student: true
				});
			}
			else if (req.user.role === "teacher") {
				res.render('exam', {
					quizList: quizList,
					Teacher: true
				});
			}
		}
	})
});

router.get('/grades', ensureAuthenticated, function (req, res) {
	res.render('grades');
});

router.get('/allQuizzes', ensureAuthenticated, function (req, res) {

	let studentList = [];
	Quiz.find({}, function (err, quizList) {
		if (err) {
			console.log(err);
		}
		else {
			
			res.render('allQuizzes', { quizList: quizList });
		}
	});
});

router.post('/login',
	passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/' }),
	function (req, res) {
		res.redirect('/');
	});

router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

router.post('/submit', function (req, res) {
	let url = require('url');
	let url_parts = url.parse(req.url, true);
	let query = url_parts.query;

	let quizId = req.query.quizId;
	let studentId = req.query.studentId;

	let submission = req.body;

	Quiz.findById(req.query.quizId, function (err, quiz) {
		if (err) {
			console.log(err);
		}
		else {
			console.log(quiz);
			let numberOfQuestions = quiz.questions.length;
			var answers = new Array();

			for (i = 1; i <= numberOfQuestions; i++) {
				let currentAnswer = {
					id: i,
					answer: submission.i
				};
				answers.push(currentAnswer);
			}

			let studentSubmission = {
				studentId: studentId,
				answers: answers
			};

			Submission.createStudentSubmission(quizId, studentSubmission, function (err, newSubmission) {
				if (err) throw err;
				console.log(newSubmission);
			});
		}
	})

	// let currentQuiz = Quiz.findById(quizId);
	// console.log("quizId: " + quizId);
	// console.log(currentQuiz.questions);
	// let numberOfQuestions = currentQuiz.questions.length;

	// var answers = {};

	// for (i = 1; i <= numberOfQuestions; i++) {
	// 	let currentAnswer = {
	// 		id: i,
	// 		answer: submission.i
	// 	};
	// 	answers.push(currentAnswer);
	// }

	// let studentSubmission = {
	// 	studentId: studentId,
	// 	answers: answers
	// };

	// Submission.createStudentSubmission(quizId, studentSubmission);


	// var newUser = new User({
	// 	name: name,
	// 	email:email,
	// 	username: username,
	// 	password: password
	// });

	// User.createUser(newUser, function(err, user){
	// 	if(err) throw err;
	// 	console.log(user);
	// });

});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/');
		//res.render('login');
	}
}

module.exports = router;