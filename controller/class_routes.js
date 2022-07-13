const express = require('express')
const Class = require('../models/class')
const router = express.Router()


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
    // console.log(req.session)
    // let session = req.session
    res.render('classes/new')
})

//=============================
//POST Request Create Class
//=============================
router.post('/', (req,res) =>{
    console.log(req.body)
    let copy = {...req.body}
    let{name, place, cat1, cred1, cat2, cred2, fullfills} = copy
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
    console.log(newClass)
    
    res.redirect("/classes/new")
})


module.exports = router