const mongoose  = require('mongoose')


const navAlertModel = mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    category: String,
    from:[],
    new:{type:Boolean, default:true},
},
 {
     timestamps : true,
 }

)

const NavAlert = mongoose.model("navAlert", navAlertModel)

module.exports = NavAlert;

