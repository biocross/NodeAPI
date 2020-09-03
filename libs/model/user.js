let mongoose = require('mongoose'),
	crypto = require('crypto'),
	findOrCreate = require('mongoose-findorcreate'),
	Schema = mongoose.Schema,

	User = new Schema({
		username: {
			type: String,
			unique: true,
			required: true
		},
		hashedPassword: {
			type: String,
			required: true
		},
		salt: {
			type: String,
			required: true
		},
		googleId: {
			type: String,
		},
		google:{
			displayName:{
				type: String
			},
			id:{
				type: String
			},
			name: {
				familyName:{type: String},
				givenName:{type: String}
			},
			photos:{
				type:Array
			},
			raw:{
				type:String
			}
		},
		created: {
			type: Date,
			default: Date.now
		}
	});
User.methods.encryptPassword = function(password) {
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512).toString('hex');
};

User.virtual('userId')
.get(function () {
	return this.id;
});

User.virtual('password')
	.set(function(password) {
		this._plainPassword = password;
		this.salt = crypto.randomBytes(32).toString('hex');
		        //more secure - this.salt = crypto.randomBytes(128).toString('hex');
		        this.hashedPassword = this.encryptPassword(password);
		    })
	.get(function() { return this._plainPassword; });


User.methods.checkPassword = function(password) {
	return this.encryptPassword(password) === this.hashedPassword;
};

User.methods.findOrCreateGoogleUser = function(profile, cb){
	return this.model('User').find({ googleId: profile.id}, (err, result)=>{
		if(err) cb(err);
		console.log(result);
	});
}

User.plugin(findOrCreate);

module.exports = mongoose.model('User', User);
