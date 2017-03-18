var express = require('express');
var router = express.Router();
var Queue = require('../models/queue');
var avgTime = 2;

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
    Queue.find({}, function(err, doc,c) {
        if(err) {
            res.send(500);
            return;
        }
        
        Queue.getQueueCount(function(err, c){
            console.log(c);
            var waitTime = c * avgTime;
        res.render('index', {queuedata: doc,count:c, waitTime: waitTime});
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

module.exports = router;