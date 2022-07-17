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
        enum: ['General Req','Probstat','AHS Concentation', 'Chem/MatSci', 'Bio', 'Design Depth', 'Major Req', 'Major Elective', 'Capstone', 'Additional Course']
    }
    },{
        strict: false,
        timestamps: true
    })
    
const Class = model('Class', classSchema)
module.exports = Class

/*
Graduation Requirements:
    Gen Course Reqs:
        Modsim
        QEA123
    Probstat:
        Oneof:
            Probstat
            Data Science
            Computational Bayes
            Neurotech
            AstroStats
    Sci Foundation
        Bio Foundation:
            OneOf
                ...
        Chem Foundation:
            OneOf
    Physics:
        QEA123
    ENGR:
        ISIM,PIE
    Capstone:
        SCOPE,ADE
    Design:
        DesNat
        CD
    Design Depth:
        OneOf...
    AHSFoundation:
        OneOf
    EFoundation:
        PandM
*/
