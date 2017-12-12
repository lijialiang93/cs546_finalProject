const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Quiz = require('../models/quiz');
const Submission = require('../models/submissions');

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
			Submission.findStudentSubmission(req.query.quizId, req.user._id, function (err, result) {
				if (result != null) {
					res.render('takeQuiz', {
						alreadyTaken: true
					});
				}
				else {
					res.render('takeQuiz', {
						quiz: quiz,
						notTaken: true
					});
				}
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
	Quiz.find({}, function (err, quizList) {
		if (err) {
			console.log(err);
		}
		else {

			res.render('allQuizzes', { quizList: quizList });
		}
	});
});

router.get('/allSubmissions', ensureAuthenticated, function (req, res) {
	let url = require('url');
	let url_parts = url.parse(req.url, true);
	let query = url_parts.query;
	let quizId = req.query.quizId;
	let quizName = req.query.quizName;
	let studentList = [];

	Submission.findSubmissionByQuizId(quizId, function (err, submissionList) {
		if (err) {
			console.log(err);
		}
		else {
			let studentSubmissionsList = submissionList.studentSubmissions;
			for (let i = 0; i < studentSubmissionsList.length; i++) {
				User.getUserById(studentSubmissionsList[i].studentId, function (err, user) {
					studentList.push(user);
				});
			}
			res.render('allSubmissions', { studentList: studentList, quizName: quizName, quizId: quizId });
		}
	});
});

router.get('/grading', ensureAuthenticated, function (req, res) {
	let url = require('url');
	let url_parts = url.parse(req.url, true);
	let query = url_parts.query;
	let quizId = req.query.quizId;
	let studentId = req.query.studentId;
	let studentName = req.query.studentName;
	let qaList = [];

	Quiz.findById(quizId, function (err, quiz) {
		let questions = quiz.questions
		Submission.findSubmissionByQuizIdAndStudentId(quizId, studentId, function (err, submission) {
			let answers = submission.studentSubmissions[0].answers;
			for(let i = 0;i<answers.length;i++){
				const qa = {
					id : questions[i].id,
					question : questions[i].content,
					answer : answers[i]
				}
				qaList.push(qa);
			}
			res.render('grading',{qaList:qaList,quiz:quiz,studentName:studentName,studentId:studentId});
		});
	});
});

router.post('/grading', ensureAuthenticated, function (req, res) {
	
	let url = require('url');
	let url_parts = url.parse(req.url, true);
	let query = url_parts.query;
	let quizId = req.query.quizId;
	let studentId = req.query.studentId;
	let score = req.body.score;
	
	User.gradeQuiz(studentId,quizId,score,function(err,cb){
		if(err){
			console.log(err);
		}
		else{
			res.redirect('allQuizzes');
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
			let numberOfQuestions = quiz.questions.length;
			var answers = new Array();

			for (i = 1; i <= numberOfQuestions; i++) {
				let currentAnswer = {
					id: i,
					answer: submission[i]
				};
				answers.push(currentAnswer);
			}

			let studentSubmission = {
				studentId: studentId,
				answers: answers
			};

			Submission.createStudentSubmission(quizId, studentSubmission, function (err, newSubmission) {
				if (err) throw err;
				res.redirect('/exam');
			});
		}
	})

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