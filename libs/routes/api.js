const express = require('express');
const passport = require('passport');
const router = express.Router();

/* GET users listing. */
router.get('/', passport.authenticate('bearer', { session: false }), function (req, res) {
    res.json({
    	msg: 'API is running'
    });
});

router.get('/hello', passport.authenticate('google', { session: false }), (req, res)=>{
   res.json({message:"Google verified!!"});
});

module.exports = router;
