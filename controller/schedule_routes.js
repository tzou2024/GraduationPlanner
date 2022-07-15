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

//=============================
//DELETE Route Delete Class
//=============================
router.delete("/:id", (req,res) =>{
    const classId= req.params.id
    function removeClassfromUser(usr, clas){
        console.log("got here")
        console.log("usr.classes: ",usr.classes)
        console.log(Array.isArray(usr.classes))
        let copy = usr.classes.filter((clat) =>{
            return clat.class != clas
        })
        console.log("filtered user: ", copy)
        return copy
    }
    User.find({})
        .then(userlist =>{
            //console.log(userlist)
            userlist.forEach((user) =>{
                //console.log(user, user.classes, classId)
                user.classes = removeClassfromUser(user, classId)
                user.save()
                console.log("SAVED USER: ", user)
                
            })
        })
        .catch(err=>{
            console.log("err removing class from users")
        })
    res.redirect('/schedule')
})

module.exports = router