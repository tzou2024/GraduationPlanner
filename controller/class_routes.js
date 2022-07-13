const express = require('express')
const Class = require('../models/class')
const router = express.Router()
const classSchema = Class.schema


//=============================
//GET Request Index
//=============================
router.get('/', (req, res) =>{
    console.log(req.session)
    let session = req.session
    Class.find({})
        .then(classes=>{
            res.render('classes/index', {session: session})
        })
        .catch(err=>{
            res.json(err)
        })
})

//=============================
//GET Request Create Class
//=============================
router.get('/new', (req, res) =>{
    console.log("CURRENT SESSION: ",req.session)
    // console.log(req.session)
    // let session = req.session
    //console.log(classSchema)
    const catoptions = ["","ENGR", "MTH", "SCI", "AHS", "E!", "GENERAL", "NON-DEGREE", "SUST"]
    let fulloptions = classSchema.obj.fulfills.enum
    fulloptions.unshift('')
    res.render('classes/new', {session: req.session, catoptions, fulloptions})
})

//=============================
//POST Request Create Class
//=============================
router.post('/', (req,res) =>{
    //console.log(req.body)
    let copy = {...req.body}
    let{name, place, cat1, cred1, cat2, cred2, fulfills} = copy
    let newClass = {
        name: name,
        place: place,
        credit_and_category: {
            [cat1]: parseInt(cred1)
        }
    }
    if(cat2 != ''){
        newClass.credit_and_category[cat2] = parseInt(cred2)
    }
    if(fulfills != ''){
        newClass['fulfills'] = fulfills
    }
    console.log(newClass)
    Class.create(newClass)
        .then(fruit =>{
            console.log("CLASS CREATED:", fruit)
            res.redirect('/classes')
        })
        .catch(err => res.json(err))
    
})


module.exports = router