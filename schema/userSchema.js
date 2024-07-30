const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    firstname : {type:String, require:true},
    lastname : {type:String, require:true},
    email:{
        type:String,
        lowercase:true,
        require:true,
        validate: (value) => {
            return validator.isEmail(value)
        }
    },
    password:{type:String, require:true},
    role:{type:String, default:'user'},
    isAdmin:{type:Boolean, default:false},
    createdAt:{type:String, default:new Date()}
}, {collection:'users', versionKey:false},
    {timestamps : true}
)

const userModel = mongoose.model('users', UserSchema)

module.exports= {userModel}