const express = require('express')
const Class = require('../models/class')
const router = express.Router()

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

module.exports = router