///////////////////////////////////
///
///////////////////////////////////
const mongoose = require('./connection')


//define and export user mode
const {Schema, model} = mongoose

// console.log("Schema", Schema)
// console.log("Model", model)

// make a user schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    major:{
        type: String
    },
    classes: {
        type: Array,
        default: []
    }
    },{
        timestamps: true,
        strict: false
    })

//make a user model with user schema
const User = model('User', userSchema)

module.exports = User