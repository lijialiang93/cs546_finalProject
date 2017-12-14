const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const xss = require('xss');
const uuidv4 = require('uuid/v4');
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

router.get('/addQuiz', ensureAuthenticated, function (req, res) {
	res.render('addQuiz');
});

router.post("/postQuiz", function (req, res) {
	console.log(req.body);
	let quizReceived = req.body;
	let newQuiz = new Quiz({
		_id: uuidv4(),
		name: quizReceived.name,
		totalScore: quizReceived.totalScore,
		questions: quizReceived.questions
	});
	Quiz.createQuiz(newQuiz, function (err, result) {
		if (err) {
			console.log("Error:" + err);
		}
		else {
			console.log("Creating Quiz: " + result);
		}
	});
	res.json({ success: true, message: xss("You have added a quiz successfully!") });
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

router.get('/grades', ensureAuthenticated, async function (req, res) {
	try {
		qsList = [];
		let allQuizzes = await Quiz.getAllQuizzes();
		for(let i = 0;i<allQuizzes.length;i++){
			let score = await User.getScoreByStudentIdAndQuizId(req.user._id,allQuizzes[i]._id);
			if(score===-1||!score){
				score = 'Not Yet Graded';
			}
			const qs = {
				name:allQuizzes[i].name,
				score:score
			};
			qsList.push(qs);
		}
		res.render('grades',{qsList:qsList});
	} catch (error) {
		console.log(error);
	}
	
});

router.get('/allQuizzes', ensureAuthenticated, async function (req, res){
	try {
		if(req.user.role==='teacher'){
			let quizList = await Quiz.getAllQuizzes();
			res.render('allQuizzes', { quizList: quizList });
		}
		else{
			res.redirect('/');
		}
	} catch (error) {
		console.log(error);
	}
});

router.get('/allSubmissions', ensureAuthenticated, async function (req, res) {


	try {
		if(req.user.role==='teacher'){
		let url = require('url');
		let url_parts = url.parse(req.url, true);
		let query = url_parts.query;
		let quizId = req.query.quizId;
		let quizName = req.query.quizName;
		let studentList = [];

		let submissionList = await Submission.findSubmissionByQuizId(quizId);
		if(submissionList === null){
			res.render('allSubmissions', { subExist:false, quizName:"No Submission"});
			return;
		}
		let studentSubmissionsList = submissionList.studentSubmissions;
	
		for (let i = 0; i < studentSubmissionsList.length; i++) {
			let student = await User.getStudentById(studentSubmissionsList[i].studentId);
			let score = await User.getScoreByStudentIdAndQuizId(studentSubmissionsList[i].studentId,quizId);
			if(score===-1||!score){
				score = 'Not Yet Graded';
			}
			const ss = {
				student:student,
				score:score
			};
			studentList.push(ss);
		}
		res.render('allSubmissions', { subExist:true,studentList: studentList, quizName: quizName, quizId: quizId });
		}
		else{
			res.redirect('/');
		}

	} catch (error) {
		console.log(error);
	}

});

router.get('/grading', ensureAuthenticated, async function (req, res) {

	try {
		if(req.user.role==='teacher'){
		let url = require('url');
		let url_parts = url.parse(req.url, true);
		let query = url_parts.query;
		let quizId = req.query.quizId;

		const studentInfo = {
			studentId : req.query.studentId,
			studentName : req.query.studentName
		};

		let qaList = [];
		let quiz = await Quiz.getQuizById(quizId);
		let questions = quiz.questions;

		
		let prevScore = await User.getScoreByStudentIdAndQuizId(studentInfo.studentId,quizId);
		if(prevScore === -1||!prevScore){
			prevScore = 'Not Yet Graded';
		}

		let submission = await Submission.findSubmissionByQuizIdAndStudentId(quizId, studentInfo.studentId);
		let answers = submission.studentSubmissions[0].answers;
	
		for (let i = 0; i < answers.length; i++) {
			const qa = {
				id: questions[i].id,
				question: questions[i].content,
				answer: answers[i]
			}
			qaList.push(qa);
		}
	
		res.render('grading',{qaList:qaList,quiz:quiz,studentInfo:studentInfo,prevScore:prevScore});
	}
	else{
		res.redirect('/');
	}
	} catch (error) {
		console.log(error);
	}
	
});

router.post('/grading', ensureAuthenticated, async function (req, res) {
	
	try {
		if(req.user.role==='teacher'){
		let url = require('url');
		let url_parts = url.parse(req.url, true);
		let query = url_parts.query;
		let quizId = req.query.quizId;
		let studentId = req.query.studentId;
		let score = req.body.score;
		
		//temp quiz ID = 1
		await User.gradeQuiz(studentId, quizId, score);
		
		res.redirect('allQuizzes');
		}
		else{
			res.redirect('/');
		}
	} catch (error) {
		console.log(error);
	}
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

	let answers = req.body;

	Quiz.findById(quizId, function (err, quiz) {
		if (err) {
			console.log(err);
		}
		else {
			let alreadyTaken = false;
			Submission.findStudentSubmission(quizId, studentId, function (err, result) {
				if (result != null) {
					res.json({ success: false, message: xss("You have submitted this quiz before!")});
				}
				else {
					let studentSubmission = {
						studentId: studentId,
						answers: answers
					};
		
					Submission.createStudentSubmission(quizId, studentSubmission, function (err, newSubmission) {
						if (err) throw err;
						res.json({ success: true, message: xss("Quiz is submitted successfully!")});
					});
				}
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