const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const methodOverride = require('method-override');

const libs = process.cwd() + '/libs/';
require(libs + 'auth/auth');

const config = require('./config');
const log = require('./log')(module);
const oauth2 = require('./auth/oauth2');

const api = require('./routes/api');
const users = require('./routes/users');
const articles = require('./routes/articles');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(passport.initialize());

app.use('/', api);
app.use('/api', api);
app.use('/api/users', users);
app.use('/api/articles', articles);
app.use('/api/oauth/token', oauth2.token);
app.get('/auth/google', passport.authenticate('google', { sessoion:false, scope: config.get('google:scope') }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', passport.authenticate('google', { sessoion:false, failureRedirect: config.get('google:failureRedirect') }),
function(req, res) {
    console.log(req, res);
    res.redirect('/api/hello');
});

// catch 404 and forward to error handler
app.use(function(req, res, next){
    res.status(404);
    log.debug('%s %d %s', req.method, res.statusCode, req.url);
    res.json({
    	error: 'Not found'
    });
    return;
});

// error handlers
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('%s %d %s', req.method, res.statusCode, err.message);
    res.json({
    	error: err.message
    });
    return;
});

module.exports = app;