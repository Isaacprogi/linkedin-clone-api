const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')


const UserSchema = new Schema({
    firstname: {
        type: String,
        required:false
    },
    lastname: {
        type: String,
        required:false
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    photo:{
        type: String,
        required: false,
        unique: false,
    },
    title:{
        type: String,
        required: false,
        unique: false,
    },
    password: {
        type: String,
        required: true,
        unique:false,
    },
    state: {
        type: String, 
        required: false, 
        unique: false,
    },
    country: {
        type: String,
        required: false,
        unique: false,
    },
    street: {
        type: String,
        required: false,
        unique: false,
    },
    pofileViews: { 
        type: String, 
        required: false, 
        unique: false
    },
    connections:[ { 
        type: mongoose.Schema.Types.ObjectId, 
        required: false, 
        unique: true,
        ref:'User',
    }],
    pendingSentConnections:[ { 
        type: mongoose.Schema.Types.ObjectId, 
        required: false, 
        unique: true,
        ref:'User',
    }],
    pendingIncommingConnections:[ { 
        type: mongoose.Schema.Types.ObjectId, 
        required: false, 
        unique: true,
        ref:'User',
    }],
    followers:[ { 
        type: mongoose.Schema.Types.ObjectId, 
        required: false, 
        unique: true,
        ref:"User",
    }],
    following:[ { 
        type: mongoose.Schema.Types.ObjectId, 
        required: false, 
        unique: true,
        ref:'User',
    }],
    about: { 
        type: String, 
        required: false, 
        unique: false
    },
    publicProfile:{ 
        type:String,
        required:false,
        unique:true},
    featured: [
        { 
         type: String, 
        required: false, 
        unique: false }
    ],
    education: [
        { 
            type: String, 
            required: false, 
            unique: false }
    ],
    jobOpportunities: [
        
        {   type: String, 
            required: false, 
            unique: false }
    ],
    experience: [
        { type: String, required: false, unique: false }
    ],
    volunteerExperience: [
        { type: String, required: false, unique: false }
    ],
    recommendations: [
        { type: String, required: false, unique: false }
    ],
    accomplishments: [
        { type: String, required: false, unique: false }
    ],
    context: [
        { type: String, required: false, unique: false }
    ],
    isAdmin: {type: Boolean,required: false,default: false,
    },
    refreshtoken:{}

},{
    timestamps: true
  }
)



UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)


})


UserSchema.methods.isMatch = function(password){
  return bcrypt.compare(password,this.password)
}

module.exports = mongoose.model('User',UserSchema)


