const express = require('express')
const Class = require('../models/class')
const User = require('../models/user')
const router = express.Router()
const classSchema = Class.schema

router.get('/', (req,res) => {
    // console.log("got to schedule")
    let userId = req.session.userId

    User.findById(userId)
    .then( (usr)=>{
        // console.log("USR IN SCHEDULE", usr)
        let classList = usr.classes
        let classstruct = []
        for(let i=1;i<=8;i++){
            let semesterstruct = []
            classList.forEach(cls => {
                if(cls.semester == i){
                Class.findById(cls.class)
                .then(res=>{
                    // console.log(i, res)
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
//GET General Reqs
//=============================
router.get('/genreqs', (req,res) =>{
    console.log("ROUTE FOUND")
    const userId = req.session.userId
    const catoptions = ["ENGR", "MTH", "SCI", "AHS", "E","GENERAL", "NON_DEGREE", "SUST"]
    
    User.findById(userId)
        .then((fuser) =>{
            const usrclasses = fuser.classes
            let classstruct = []
            //for each semester
            for(let i = 1;i<=8;i++){
                // //make an inital object with each category
                let catOptObj = {}
                catoptions.forEach(category =>{
                catOptObj[`${category}`] = 0
                })
                classstruct.push(catOptObj)
            }
            //THIS RIGHT HERE IS A DOOSIE
            let promises = fuser.classes.map(function(classInUsrClasses){
                return Class.findById(classInUsrClasses.class).then(function(fclass){
                    for (const [key, value] of Object.entries(fclass.credit_and_category)) {
                        //console.log(key)
                        //console.log(classstruct[classInUsrClasses.semester - 1])
                        classstruct[classInUsrClasses.semester - 1][`${key}`] += value
                        console.log("UPDATED TO ")
                        console.log(classstruct[classInUsrClasses.semester - 1])

                      }
                    return classstruct
                })
            })

            Promise.all(promises).then(function(results){
                res.json(results.slice(-1)[0])
            })






            // // console.log("Classstruct: ",classstruct)
            // fuser.classes.map(classInUsrClasses =>{
            //     //console.log("classInUsrClasses ",classInUsrClasses)
            //     Class.findById(classInUsrClasses.class)
            //     .then(fclass=>{
            //         //console.log("fclass: ", fclass)
            //         for (const [key, value] of Object.entries(fclass.credit_and_category)) {
            //             //console.log(key)
            //             //console.log(classstruct[classInUsrClasses.semester - 1])
            //             classstruct[classInUsrClasses.semester - 1][`${key}`] += value
            //             console.log("UPDATED TO ")
            //             console.log(classstruct[classInUsrClasses.semester - 1])

            //           }
            //           //console.log("[classInUsrClasses.semester - 1]", [classInUsrClasses.semester - 1])
            //     }
            //     ).then(thening =>{
            //         console.log("one iteration")
            //         return true
            //     }
            //    )

            // })
        })
        // .then(classstruct =>{
        //     console.log(classstruct)
        //     res.redirect('/schedule')
        // })
})


//=============================
//GET class semester
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

//=============================
//PUT edit class semester
//=============================
router.put("/:id/:semester", (req,res) =>{
    const userId = req.session.userId
    const ID = req.params.id
    console.log("ID AT TOP: ", ID)
    const semnumb = parseInt(req.params.semester)
    const semester_to_change_to = parseInt(req.body.semnumbtochangeto)
    User.findById(userId)
        .then(fuser =>{
            console.log("SEMESTER_TO_CHANGE_TO: ",semester_to_change_to)
            console.log("FUSER>CLASSES: )", fuser.classes)
            const newmap = fuser.classes.map(ell =>{
                // console.log("ell.class: ",ell.class,"ID: ",ID)
                if((ell.class == ID) && (ell.semester == semnumb)){
                    
                    ell.semester = semester_to_change_to
                    console.log("chnged semester")
                    return ell
                }
                else{
                    // console.log("iteratednotfound")
                    return ell
                }
            })
            console.log("NEWMAP: ", newmap)
            fuser.classes = newmap
            fuser.markModified('classes')
            console.log("NEW FUSER>CLASSES: ", fuser.classes)
            return fuser.save()
                .then(savedDoc =>{
                    console.log(fuser, savedDoc,"savedDoc === fuser ",savedDoc === fuser)
                    res.redirect('/schedule')
                })
                
            
            

        })
        .catch(err=>{
            console.log("error finding user for class edit: ", err)
        })
        

})



module.exports = router