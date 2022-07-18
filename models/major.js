//use an already eted mongoose
const mongoose = require('./connection')

//get keys out of mongoose
const {Schema, model} = mongoose

//['mandatory','AHSFound','probStat','AHSConcentration', 'ChemMatSci', 'bioFound', 'desDepth', 'majorReq', 'majorElective', 'capstone', 'additional']

//make a schema
const majorSchema = new Schema({
    name: {
        type: String
    },
    mandatory: {
        type: Object,
        default: {
            needed: 10,
            options: ["QEA1", "QEA2", "QEA3", "OFYI", "DesNat", "ModSim", "ISIM", "P and M", "CD", "PIE"],
           
        }
    },
    probStat: {
        type: Object,
        default: {
            needed: 1,
            options: ["ProbAndStat", "Data Science", "Bayesian Stats", "Neurotech", "AstroStats"]
        }
    },
    AHSFound: {
        type: Object,
        default: {
            needed: 1,
            options: ["Identity", "Demand"]
        }
    },
    majorReq: {
        type: Object
    },
    majorElective: {
        type: Object
    }

    
    },{
        strict: false,
        timestamps: true
    })
    
const Major = model('Major', majorSchema)
module.exports = Major
