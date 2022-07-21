const express = require('express')
const Class = require('../models/class')
const User = require('../models/user')
const Major = require('../models/major')
const _ = require('lodash')
const router = express.Router()
const classSchema = Class.schema

//custon middleware
router.use((req,res,next) =>{
	if(!req.session.hasOwnProperty('loggedIn')){
		res.redirect('/users/login')
	
	}
	else{
		next()
	}

    //you HAVE to call next at the end of the middleware
    
})

router.get('/', (req,res) => {
    // console.log("got to schedule")
    let userId = req.session.userId

    // var promises = [obj1, obj2].map(function(obj){
    //     return db.query('obj1.id').then(function(results){
    //        obj1.rows = results
    //        return obj1
    //     })
    //   })
    //   Promise.all(promises).then(function(results) {
    //       console.log(results)
    //   })


    User.findById(userId)
    .then( (usr)=>{
        console.log("USR IN SCHEDULE", usr)
        let classList = usr.classes
        let classstruct = []
        for(let i=1;i<=8;i++){
            let semesterstruct = []

            let onesem = classList.filter(cls=>{
                return cls.semester == i
            })

            let promises = onesem.map(function(cls){
                return Class.findById(cls.class).then(function(results){
                    return results
                })
            })

            promises.all(promises).then(function(results){
                console.log(i, results)
                classstruct.push(results)
            })

            // classList.forEach(cls => {
            //     if(cls.semester == i){
            //     Class.findById(cls.class)
            //     .then(res=>{
            //         // console.log(i, res)
            //         semesterstruct.push(res)})}
            // })
            // classstruct.push(semesterstruct)
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
    //includes functionality for  if class inputted multiple times, even in same semester

    function removeClassfromUser(usr, clas, numb){
        // console.log("got here")
        console.log("usr.classes: ",usr.classes)

        let objectToFind = {
            class: clas,
            semester: parseInt(numb)
        }
        console.log("objectobjectToFind", objectToFind)

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

                    

                })
                console.log("orderedFinal: ", orderedFinal)

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
                    remaining[`${property}`] = (finalRequired[`${property}`] - cumTotal[`${property}`]) < 0 ? 0 : finalRequired[`${property}`] - cumTotal[`${property}`]
                  }
                
                orderedFinal.push(finalRequired)
                orderedFinal.push(remaining)
                res.render('schedule/genreqs', {session: req.session, orderedFinal, catKeys: Object.keys(finalRequired)})

                
                
            })

        })

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
    console.log("REQ BODY: ", req.body)
    User.findById(userId)
        .then(fuser =>{

            /*
            function removeClassfromUser(usr, clas, numb){
        // console.log("got here")
        console.log("usr.classes: ",usr.classes)

        let objectToFind = {
            class: clas,
            semester: parseInt(numb)
        }
        console.log("objectobjectToFind", objectToFind)

        let idx = usr.classes.findIndex(p=>_.isEqual(p, objectToFind))

        console.log(idx)

        if(idx > -1){
            usr.classes.splice(idx,1)
        }
            */
            console.log("SEMESTER_TO_CHANGE_TO: ",semester_to_change_to)
            console.log("FUSER>CLASSES: )", fuser.classes)

            let objectToFind = {
                class: ID,
                semester: parseInt(semnumb)
            }
            let objectToChangeTo = {
                class: ID,
                semester: parseInt(semester_to_change_to)
            }

            let idx = fuser.classes.findIndex(p=>_.isEqual(p, objectToFind))

            if(idx > -1){
                fuser.classes.splice(idx,1, objectToChangeTo)
            }
            
            // const newmap = fuser.classes.map(ell =>{
            //     // console.log("ell.class: ",ell.class,"ID: ",ID)
            //     if((ell.class == ID) && (ell.semester == semnumb)){
                    
            //         ell.semester = semester_to_change_to
            //         console.log("chnged semester")
            //         return ell
            //     }
            //     else{
            //         // console.log("iteratednotfound")
            //         return ell
            //     }
            // }) 
            // console.log("NEWMAP: ", newmap)
            // fuser.classes = newmap
            // console.log("NEW FUSER>CLASSES: ", fuser.classes)
            fuser.markModified("classes")
            delete fuser.semnumbtochangeto
            return fuser.save()
                .then(savedDoc =>{
                    console.log(savedDoc == fuser)
                    res.redirect('/schedule')
                })

        })
        .catch(err=>{
            console.log("error finding user for class edit: ", err)
        })
        

})



module.exports = router