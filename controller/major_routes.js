const express = require('express')
const Class = require('../models/class')
const User = require('../models/user')
const Major = require('../models/major')
const _ = require('lodash')
const router = express.Router()
const classSchema = Class.schema

//custon middleware for sesion expiration
router.use((req,res,next) =>{
    console.log(req.session)
	if(!req.session.hasOwnProperty('loggedIn')){
		res.redirect('/users/login')
	
	}
	else{
		next()
	}

    //you HAVE to call next at the end of the middleware
    
})

router.get('/', (req,res) =>{
    let userID = req.session.userId
    let usrClassList = []

    //================
    //Get classes and fulfills
    //================

    User.findById(userID)
    .then((fuser) =>{
        const usrclasses = fuser.classes

        let promises = usrclasses.map(function(classInUsrClasses){
            return Class.findById(classInUsrClasses.class).then(function(fclass){
                //console.log("fclass", fclass)
                let classAndFulfills = {
                    name: fclass.name,
                    fulfills: fclass.fulfills
                }
                return classAndFulfills
            })
        })

        Promise.all(promises).then(function(results) {
            //console.log("results", results)
            usrClassList = results
            User.findById(req.session.userId)
    .then(fuser =>{
        //console.log("fuser.major",fuser.major)
        let major = fuser.major
        let query = {}
        query["name"] = major 
        Major.find(query)
        .then(userMajor =>{
           // console.log(userMajor[0]._doc)
            fulloptions = {...userMajor[0]._doc}
            let remover = ["_id", "name", "updatedAt", "createdAt", "__v"]
            remover.forEach(ell =>{
                delete fulloptions[`${ell}`]
            })
            //console.log("fulloptions", fulloptions)
            for (const [key, value] of Object.entries(fulloptions)) {
                
                fulloptions[`${key}`]["has"] = []
                //console.log(key)
                //console.log(fulloptions[`${key}`])
              }

            //====
            //Once we have the major classes and the usr class, cross reference the and add
            //====
            //go through usr classes
            usrClassList.forEach(ell =>{
                //if fulfillment isn't in major keys for some seeding error reason, shove it into additional classes
                if((!(Object.keys(fulloptions).includes(ell.fulfills))) || (ell.fulfills == "") || (!ell.hasOwnProperty('fulfills'))){
                    fulloptions["additional"]["has"].push(ell.name)
                }
                //if what the class fulfills is in what the major requires, the class isn't overfilling the number of required classes, and it isn't already in the classes you've taken in that cateogrym add it
                else if ((fulloptions[`${ell.fulfills}`]["options"].includes(ell.name)) && (fulloptions[`${ell.fulfills}`]["has"].length < fulloptions[`${ell.fulfills}`]["needed"]) && (!fulloptions[`${ell.fulfills}`]["has"].includes(ell.name))){
                    fulloptions[`${ell.fulfills}`]["has"].push(ell.name)
                }
                //for users that need to create classes bc they are studying abroad to fulfill their arts, and humanities credits
                else if(ell.fulfills == "ahseConcentration"){
                    fulloptions["ahseConcentration"]["has"].push(ell.name)
                }
                //if it makes it through all that, add it to additional as well
                else{
                    fulloptions["additional"]["has"].push(ell.name)
                }
                
            })

            for (const [key, value] of Object.entries(fulloptions)) {
                if(fulloptions[`${key}`]["has"].length == fulloptions[`${key}`]["needed"]){
                    fulloptions[`${key}`]["done"] = true 
                }
                else{
                    fulloptions[`${key}`]["done"] = false 
                }
                
            }

            //====
            //once crossreferenced, reorganize into big object that makes sense in my head
            //there's definetely a better way to do this but this is where my mind went
            //once organizated into object, split into collumns
            //col1: if required class display, if x classes out of y category required,
            //display category
            //col2: if required class, completed or not, if cateogry, completed or show options for completion
            //====
            
            let forkeys = []
            let forvalues = []
            
            
            let col1 = []
            let col2 = []
            for (const [key, value] of Object.entries(fulloptions)){
                //====
                //as many rows as needed
                //====
                if(value.needed == value.options.length){
                    value.options.forEach(ell=>{
                        col1.push(ell)
                        if(value.has.includes(ell)){
                            col2.push("✅\n" + ell)
                        }
                        else{
                            col2.push("❌")
                        }
                    })
                }
                else if (key == "ahseConcentration"){
                    for(let i = 0;i < value.needed;i++){
                        col1.push(key)
                        if(value.has[i]){
                            col2.push("✅\n" + value.has[i])
                        }
                        else{
                            col2.push("❌")
                        }
                    }

                }
                else{
                    for(let i = 0;i < value.needed;i++){
                        col1.push(key)
                    }


                    if(value.needed == value.has.length){
                        for(let i = 0;i<value.needed;i++){
                            col2.push("✅\n" + value.has[i])
                        }
                    }
                    else{
                        for(let i = 0;i<value.needed;i++){
                            if(value.has[i]){
                                col2.push("✅\n" + value.has[i])
                            }
                            else{
                                col2.push("❌\n" + value.options.join("\n"))
                            }
                        }
                        
                    }
                }
            }
            if(fulloptions.additional.has.length > 0){
                fulloptions.additional.has.forEach(ell=>{
                    col1.push("additional")
                    col2.push(ell)
                })
            }
            
            
            console.log(fulloptions)
            //console.log("col1", col1)
            res.render('major/index', {session: req.session, fulloptions, forkeys, forvalues, col1, col2})
        })
    })

        })
    })

    //console.log("usrClassList", usrClassList)
    //===========================
    //Then
    //===========================

    
})

module.exports = router