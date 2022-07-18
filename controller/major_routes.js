const express = require('express')
const Class = require('../models/class')
const User = require('../models/user')
const Major = require('../models/major')
const _ = require('lodash')
const router = express.Router()
const classSchema = Class.schema

router.get('/', (req,res) =>{
    let userID = req.session.userId
    User.findById(req.session.userId)
    .then(fuser =>{
        console.log("fuser.major",fuser.major)
        let major = fuser.major
        let query = {}
        query["name"] = major 
        Major.find(query)
        .then(userMajor =>{
            console.log(userMajor[0])
            fulloptions = Object.keys(userMajor[0]._doc)
            let remover = ["_id", "name", "updatedAt", "createdAt", "__v"]
            remover.forEach(ell =>{
                _.remove(fulloptions, (number) => number == ell)
            })
            console.log("fulloptions", fulloptions)
            
            res.json(userMajor[0]._doc)
        })
    })
})

module.exports = router