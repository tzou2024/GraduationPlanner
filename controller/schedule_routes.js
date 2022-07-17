const express = require('express')
const Class = require('../models/class')
const User = require('../models/user')
const router = express.Router()
const classSchema = Class.schema
const _ = require('lodash')

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
    const deletedOneFlag = false

    function removeClassfromUser(usr, clas, numb){
        // console.log("got here")
        console.log("usr.classes: ",usr.classes)

        let objectToFind = {
            class: clas,
            semester: parseInt(numb)
        }
        console.log(objectToFind)

        let idx = usr.classes.findIndex(p=>_.isEqual(p, objectToFind))
        console.log(idx)

        if(idx > -1){
            usr.classes.splice(idx,1)
        }

        console.log("spliced")
        
        // console.log(Array.isArray(usr.classes))
        // let copy = usr.classes.filter((clat) =>{
        //     console.log(clat)
        //     console.log((clat.class!= clas), (clat.semester != parseInt(numb)))
        //     // console.log(((clat.class != clas) ,(clat.semester != numb)))
            
        //     return (((clat.class != clas) || (clat.semester != numb)))
        // })
        return usr.classes
    }
    User.find({})
        .then(userlist =>{
            //console.log(userlist)
            userlist.forEach((user) =>{
                //console.log(user, user.classes, classId)
                user.classes = removeClassfromUser(user, classId, semnumb)
                delete user[`semnumbtochangeto`]
                console.log("semnumbtochangeto: ", user.semnumbtochangeto)
                user.markModified()
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
            let resultReplace = [...classstruct]
            //THIS RIGHT HERE IS A DOOSIE
            let promises = fuser.classes.map(function(classInUsrClasses){
                return Class.findById(classInUsrClasses.class).then(function(fclass){
                    for (const [key, value] of Object.entries(fclass.credit_and_category)) {
                        //console.log(key)
                        //console.log(classstruct[classInUsrClasses.semester - 1])
                        classstruct[classInUsrClasses.semester - 1][`${key}`] += value
                        // console.log("UPDATED TO ")
                        // console.log(classstruct[classInUsrClasses.semester - 1])

                      }
                    return classstruct
                })
            })
            let cumTotal = {
                'ENGR': 0,
                'MTH': 0,
                'MTH_and_SCI': 0,
                'AHS': 0,
                "AHSE": 0,
                'other': 0,
                'total': 0
            }
            let remaining = {...cumTotal}

            Promise.all(promises).then(function(results){
                let orderedFinal = []
                let updatedclassstruct = results.slice(-1)[0]
                if(!updatedclassstruct){
                    updatedclassstruct = resultReplace
                }
                updatedclassstruct.forEach(semester =>{
                    let objectOrder = {
                        'ENGR': null,
                        'MTH': null,
                        'MTH_and_SCI': null,
                        'AHS': null,
                        "AHSE": null,
                        'other': null,
                        'total': null
                    }

                    semester.total = Object.values(semester).reduce((a,b) => a + b, 0)
                    semester['AHSE'] = semester['AHS'] + semester['E']
                    semester['MTH_and_SCI'] = semester['MTH'] + semester['SCI']
                    semester[`other`] = semester['GENERAL'] + semester['NON_DEGREE'] + semester['SUST']
                    
                    let deleteList =['SCI', 'E', 'GENERAL','NON_DEGREE','SUST']
                    deleteList.forEach(ell=>{
                        delete semester[ell]
                    })

                    let orderedSemester = Object.assign(objectOrder, semester)
                    // console.log("ORDEREDSEMESTER", orderedSemester)
                    orderedFinal.push(orderedSemester)

                    for (const property in orderedSemester) {
                        cumTotal[`${property}`]+=orderedSemester[`${property}`]
                      }
                    // console.log("pushed")
                    // console.log(orderedFinal)
                    

                })
                console.log("orderedFinal: ", orderedFinal)

                                //res.json(results.slice(-1)[0])

                // required: 
                //      
                //     Engineering: 46
                //     Math: 10
                //     Math and Science: 30
                //     Ahs: 12
                //     AHSE:28
                //     other: 0
                //     total: 120
                let finalRequired = {
                    'ENGR': 46,
                    'MTH': 10,
                    'MTH_and_SCI': 30,
                    'AHS': 12,
                    'AHSE': 28,
                    'other': 0,
                    'total': 120
                }
                orderedFinal.push(cumTotal)
                
                for (const property in cumTotal) {
                    remaining[`${property}`] = finalRequired[`${property}`] - cumTotal[`${property}`]
                  }
                
                orderedFinal.push(finalRequired)
                orderedFinal.push(remaining)
                res.render('schedule/genreqs', {session: req.session, orderedFinal, catKeys: Object.keys(finalRequired)})

                
                
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
            delete fuser.semnumbtochangeto
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