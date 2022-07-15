const express = require('express')
const Class = require('../models/class')
const User = require('../models/user')
const router = express.Router()
const classSchema = Class.schema

router.get('/', async function (req,res, next){
    let userId = req.session.userId

    User.findById(userId)
    .then( (usr)=>{
        let classList = usr.classes
        let classstruct = []
        for(let i=1;i<=8;i++){
            let semesterstruct = []
            classList.forEach(cls => {
                if(cls.semester == i){
                Class.findById(cls.class)
                .then(res=>{
                    console.log(i, res)
                    semesterstruct.push(res)})}
            })
            classstruct.push(semesterstruct)
        }
        setTimeout(() => console.log("classstruct: ",classstruct), 500)
        res.render('schedule/index', {classes: classstruct,
        session: req.session})
    })
    .catch(err=>{
        console.log("ERR getting my schedule: ", err)
        res.send(err)
    })
})

module.exports = router