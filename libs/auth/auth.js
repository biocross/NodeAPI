const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const lodash = require('lodash');
const libs = process.cwd() + '/libs/';

const config = require(libs + 'config');

const User = require(libs + 'model/user');
const Client = require(libs + 'model/client');
const AccessToken = require(libs + 'model/accessToken');
const RefreshToken = require(libs + 'model/refreshToken');

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new BasicStrategy(
    function(username, password, done) {
        Client.findOne({ clientId: username }, function(err, client) {
            if (err) {
            	return done(err);
            }

            if (!client) {
            	return done(null, false);
            }

            if (client.clientSecret !== password) {
            	return done(null, false);
            }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        Client.findOne({ clientId: clientId }, function(err, client) {
            if (err) {
            	return done(err);
            }

            if (!client) {
            	return done(null, false);
            }

            if (client.clientSecret !== clientSecret) {
            	return done(null, false);
            }

            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, done) {
        AccessToken.findOne({ token: accessToken }, function(err, token) {

            if (err) {
            	return done(err);
            }

            if (!token) {
            	return done(null, false);
            }

            if( Math.round((Date.now()-token.created)/1000) > config.get('security:tokenLife') ) {

                AccessToken.remove({ token: accessToken }, function (err) {
                    if (err) {
                    	return done(err);
                    }
                });

                return done(null, false, { message: 'Token expired' });
            }

            User.findById(token.userId, function(err, user) {

                if (err) {
                	return done(err);
                }

                if (!user) {
                	return done(null, false, { message: 'Unknown user' });
                }

                let info = { scope: '*' };
                done(null, user, info);
            });
        });
    }
));

passport.use(new GoogleStrategy({
        clientID: config.get('google:clientId'),
        clientSecret: config.get('google:clientSecret'),
        callbackURL: config.get('google:callback')
    },
    function(accessToken, refreshToken, profile, done) {
        User.find({ googleId: profile.id }, function (err, user) {
            if(err){done(err, null);}
            if(!lodash.isEmpty(user)){
                if (lodash.isArray(user)){user = user[0];}
                for (let key in profile){
                    if (key in user){
                        user[key] = profile[key];
                    }
                }
            } else {
                let profileObject = {
                    username:profile.id,
                    password:profile.id,
                    googleId:profile.id,
                    google:profile
                }
                user = new User(profileObject);
            }
            user.save();
            return done(err, user);
        });
    }
));