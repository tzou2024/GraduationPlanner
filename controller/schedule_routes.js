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
        //setTimeout(() => console.log("classstruct: ",classstruct), 500)
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
router.delete("/:id/:semester", (req,res) =>{
    const classId= req.params.id
    const semnumb = req.params.semester
    // console.log("semnumb: ",semnumb)
    // console.log("typeof: ", typeof(semnumb))

    function removeClassfromUser(usr, clas, numb){
        // console.log("got here")
        console.log("usr.classes: ",usr.classes)
        // console.log(Array.isArray(usr.classes))
        let copy = usr.classes.filter((clat) =>{
            console.log(clat)
            console.log((clat.class!= clas), (clat.semester != parseInt(numb)))
            // console.log(((clat.class != clas) ,(clat.semester != numb)))
            return (((clat.class != clas) || (clat.semester != numb)))
        })
        return copy
    }
    User.find({})
        .then(userlist =>{
            //console.log(userlist)
            userlist.forEach((user) =>{
                //console.log(user, user.classes, classId)
                user.classes = removeClassfromUser(user, classId, semnumb)
                user.save()
                console.log("SAVED USER: ", user)
                res.redirect('/schedule')
            })
        })
        .catch(err=>{
            console.log("err removing class from users")
        })
    
})

//=============================
//Edit a class semester
//=============================
router.get("/:id/:semester", (req,res) =>{
    const userId = req.session.userId
    const ID = req.params.id
    const semnumb = parseInt(req.params.semester)
    User.findById(userId)
        .then(fuser =>{
            let userclasses = fuser.classes
            let classobj
            let class_to_edit = userclasses.filter((clat) =>{
                return (((clat.class == ID) && (clat.semester == semnumb)))
            })[0]
            Class.findById(class_to_edit.class)
            .then(here=>{
                //console.log(here)
                classobj = here
                res.render('schedule/edit', {class: classobj, semnumb,
                    session: req.session})
            })
            .catch(err=>{
                "err finding class for class edit: ", err
            })
            

        })
        .catch(err=>{
            console.log("error finding user for class edit: ", err)
        })

})


module.exports = router