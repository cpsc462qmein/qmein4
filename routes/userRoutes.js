var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Queue = require('../models/queue');

var avgTime = 2; // MINUTES

// Add to Queue
router.post('/addtoqueue', function(req, res){
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var phonenumber = req.body.phonenumber;
	var email = req.body.email;
	
	// If user is already queued, redirect user to the queuestatus.
		var newQueue = new Queue({
		firstname: firstname,
		lastname: lastname,
		phonenumber: phonenumber,
		email: email
		});
	
		Queue.createQueue(newQueue, function(err, queue){
			if(err) throw err;
		});
		
		console.log('The following user added to queue:');
		console.log(req.body.firstname, req.body.lastname);
		console.log(req.body.email);
		console.log(req.body.phonenumber);
		res.redirect('/queuestatus');
});

// Queue Out
router.post('/queueOut', function(req,res){
	Queue.findOneAndRemove(req.body.email, function(err){
		if (err) throw err;
		console.log('user queued out');
		res.redirect('/');
	});
});

// Register User
router.post('/registeruser', function(req, res){
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var phonenumber = req.body.phonenumber;
	var username = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('firstname', 'First Name is required').notEmpty();
	req.checkBody('lastname', 'Last Name is required').notEmpty();
	req.checkBody('phonenumber', 'Phone Number is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			firstname: firstname,
			lastname: lastname,
			phonenumber: phonenumber,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');
		
		res.redirect('/users/login');
	}
});

module.exports = router;