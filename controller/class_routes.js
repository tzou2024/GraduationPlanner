const express = require('express')
const Class = require('../models/class')
const router = express.Router()
//importing fruit model to access database
const Fruit = require('../models/class')

router.get('/', (req, res) =>{
    Class.find({})
        .then(classes=>{
            res.send(classes)
        })
        .catch(err=>{
            res.json(err)
        })
})

module.exports = router