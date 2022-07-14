const express = require('express')
const Class = require('../models/class')
const User = require('../models/user')
const router = express.Router()
const classSchema = Class.schema

router.get('/', (req,res) =>{
    let userId = req.session.userId

    User.findById(userId)
    .then(usr=>{
        
    })
    .catch(err=>{
        console.log("ERR getting my schedule: ", err)
        res.send(err)
    })
})

module.exports = router