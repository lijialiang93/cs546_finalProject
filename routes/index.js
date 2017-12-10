let express = require('express');
let router = express.Router();
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let User = require('../models/user');
let Quiz = require('../models/quiz');
let Submission = require('../models/submissions');

router.get('/', ensureAuthenticated, function(req, res){
	res.render('dashboard');
});

router.get('/login',ensureAuthenticated, function(req, res){
  res.redirect('/');
});

router.get('/dashboard', ensureAuthenticated, function(req, res){
	res.render('dashboard');
});

router.get('/information', ensureAuthenticated, function(req, res){
	res.render('information');
});

router.get('/takeQuiz', ensureAuthenticated, function(req, res){
	let url = require('url');
	let url_parts = url.parse(req.url, true);
	let query = url_parts.query;
	Quiz.findById(req.query.quizId,function(err,quiz){
		if(err){
			console.log(err);			
		}
		else{
			console.log(quiz);
			res.render('takeQuiz',{
        quiz: quiz
    });
		}
	})

});

router.get('/exam', ensureAuthenticated, function(req, res){
	Quiz.find({},function(err,quizList){
		if(err){
			console.log(err);			
		}
		else{
			res.render('exam',{
        quizList: quizList
    });
		}
	})
});

router.get('/grades', ensureAuthenticated, function(req, res){
	res.render('grades');
});

router.post('/login',
passport.authenticate('local', {successRedirect:'/dashboard', failureRedirect:'/'}),
function(req, res) {
  res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.post('/submit', function(req, res){
	let url = require('url');
	let url_parts = url.parse(req.url, true);
	let query = url_parts.query;

	let quizId = req.query.quizId;
	let studentId = req.query.studentId;

		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.render('login');
	}
}

module.exports = router;