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
        type: String,
        enum: ["ME", "ECE", "EBio", "E:C", "E:D", "E:Robo", "E:Sust"]
    },
    classes: {
        type: Object,
        default: {
            sem1: [],
            sem2: [],
            sem3: [],
            sem4: [],
            sem5: [],
            sem6: [],
            sem7: [],
            sem8:[]
        }
    }
    },{
        timestamps: true,
        strict: false
    })

//make a user model with user schema
const User = model('User', userSchema)

module.exports = User