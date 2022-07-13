//use an already eted mongoose
const mongoose = require('./connection')

//get keys out of mongoose
const {Schema, model} = mongoose

//make a schema
const majorSchema = new Schema({

    },{
        strict: false,
        timestamps: true
    })
    
const Class = model('Class', classSchema)
module.exports = Class
