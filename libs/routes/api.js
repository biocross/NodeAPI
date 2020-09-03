const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../model/user');
/* GET users listing. */
router.get('/', passport.authenticate('bearer', { session: false }), function (req, res) {
    res.json({
    	msg: 'API is running'
    });
});

module.exports = router;
