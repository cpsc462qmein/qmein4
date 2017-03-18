var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Merchant = require('../models/merchant');
var Queue = require('../models/queue');

var avgTime = 2;

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// QueueStatus
router.get('/queuestatus', ensureAuthenticated, function(req, res){
	Queue.find({}, function(err, doc,c) {
        if(err) {
            res.send(500);
            return;
        }
        
        // Wanted to get a count of people in line
        Queue.getQueueCount(function(err, c){
            console.log(c);
            var waitTime = (c-1) * avgTime;
        res.render('queuestatus', {queuedata: doc,count:c, waitTime: waitTime});
        });
    });
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

// Add to Queue
router.post('/addtoqueue', function(req, res){
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var phonenumber = req.body.phonenumber;
	var email = req.body.email;
	
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
	res.redirect('/users/queuestatus');
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

// Register Merchant
router.post('/registermerchant', function(req, res){
	var businessname = req.body.businessname;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var phonenumber = req.body.phonenumber;
	var username = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('businessname', 'Business Name is required').notEmpty();
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
		var newMerchant = new Merchant({
			businessname: businessname,
			firstname: firstname,
			lastname: lastname,
			phonenumber: phonenumber,
			username: username,
			password: password
		});

		Merchant.createMerchant(newMerchant, function(err, merchant){
			if(err) throw err;
			console.log(merchant);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});

passport.use('user', new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown Username'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.use('merchant', new LocalStrategy(
  function(username, password, done) {
   Merchant.getMerchantByUsername(username, function(err, merchant){
   	if(err) throw err;
   	if(!merchant){
   		return done(null, false, {message: 'Unknown Username'});
   	}

   	Merchant.comparePassword(password, merchant.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, merchant);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
 }));
  
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Merchant.getMerchantById(id, function(err, user){
    if(err) done(err);
		if(user){
			done(null, user);
		} else {
			User.getUserById(id, function(err, user){
				if(err) done(err);
				done(null, user);
			})
		}
	})
});

router.post('/loginuser',
  passport.authenticate(['user', 'merchant'], {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });
  
  
// Merchant Delete User from queue
router.post('/deleteuser', function(req, res){
	// find the user with id 
	Queue.findByIdAndRemove(req.body.id, function(err) {
		if (err) throw err;
		// deleted the user
		console.log('User deleted!');
		});

	res.redirect('/');
});


router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;