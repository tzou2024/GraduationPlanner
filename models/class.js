//use an already eted mongoose
const mongoose = require('./connection')

//get keys out of mongoose
const {Schema, model} = mongoose

//make a schema
const classSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    credit_and_category: Object,
    place: {
        type: String,
        default: "Olin"
    },
    fulfills: {
        type: String,
        enum: ['Probstat','AHS Concentation', 'Chem/MatSci', 'Design Depth', 'Major Req', 'Major Elective', 'Capstone', 'Additional Course']
    }
    },{
        strict: false,
        timestamps: true
    })
    
const Class = model('Class', classSchema)
module.exports = Class
