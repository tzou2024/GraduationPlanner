const express = require('express')
const Class = require('../models/class')
const User = require('../models/user')
const Major = require('../models/major')
const _ = require('lodash')
const router = express.Router()
const classSchema = Class.schema

function objToString (obj) {
    let str = '';
    for (const [p, val] of Object.entries(obj)) {
        str += `${p}: ${val}\n`;
    }
    return str;
}

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

//=============================
//DELETE Route Delete Class
//=============================
router.delete("/:id", (req,res) =>{
    const classId= req.params.id
    

    Class.findByIdAndRemove(classId)
    .then(classf =>{

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



        res.redirect('/catalogue')
    })
    .catch(err =>{
        res.json(err)
    })
})

//=============================
//GET Route Edit Class
//=============================
router.get("/:id/edit", (req,res) =>{
    const classId= req.params.id
    const catoptions = ["ENGR", "MTH", "SCI", "AHS", "E","GENERAL", "NON_DEGREE", "SUST"]
    let fulloptions = classSchema.obj.fulfills.enum

    Class.findById(classId)
        .then(classf =>{
            
            const keys = Object.keys(classf.credit_and_category)
            const values = Object.values(classf.credit_and_category)
            keys.unshift("")
            catoptions.unshift("")
            values.unshift("")
            console.log(keys, values)
            const length = keys.length - 1

            res.render('catalogue/edit', {class: classf, catoptions, fulloptions, keys, values, length, session: req.session})
        })
        .catch(err=>{
            res.json(err)
        })

})



//=============================
//GET Request Index
//=============================
router.get('/', (req, res) =>{
    console.log(req.session)
    let session = req.session
    Class.find({})
        .then(classes=>{
            let classesclone = [...classes]
            classesclone.forEach(ell=>{
                ell.credit_and_category = objToString(ell.credit_and_category)
            })
            let length = _.range(0,classesclone.length)
            //console.log("LENGTH: ", length)
            res.render('catalogue/index', {session: session,length, classes: classesclone})
        })
        .catch(err=>{
            res.json(err)
        })
})

//=============================
//GET Request Create Class
//=============================
router.get('/new', (req, res) =>{
    console.log("CURRENT SESSION: ",req.session)
    // console.log(req.session)
    // let session = req.session
    //console.log(classSchema)
    let fulloptions
    let major
    const catoptions = ["","ENGR", "MTH", "SCI", "AHS", "E","GENERAL", "NON_DEGREE", "SUST"]
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
            fulloptions.unshift("")
            console.log("fulloptions", fulloptions)
            res.render('catalogue/new', {session: req.session, catoptions, fulloptions})
        })
    })
    
    // let fulloptions = classSchema.obj.fulfills.enum
    // fulloptions.unshift('')
    
})

//=============================
//POST Request Create Class
//=============================
router.post('/', (req,res) =>{
    //console.log(req.body)
    let copy = {...req.body}
    let{name, place, cat1, cred1, cat2, cred2, cat3, cred3, fulfills} = copy
    let newClass = {
        name: name,
        place: place,
        credit_and_category: {
            [cat1]: parseInt(cred1)
        }
    }
    if(cat2 != ''){
        newClass.credit_and_category[cat2] = parseInt(cred2)
    }
    if(cat3 != ''){
        newClass.credit_and_category[cat3] = parseInt(cred3)
    }
    if(fulfills != ''){
        newClass['fulfills'] = fulfills
    }
    //console.log(newClass)
    Class.create(newClass)
        .then(fruit =>{
            console.log("CLASS CREATED:", fruit)
            res.redirect('/catalogue')
        })
        .catch(err => res.json(err))
    
})

//=============================
//GET Request Search Class
//=============================
router.get('/search', (req, res) =>{
    //console.log("CURRENT SESSION: ",req.session)
    //console.log(req.session)
    // let session = req.session
    // const catoptions = ["","ENGR", "MTH", "SCI", "AHS", "E!", "GENERAL", "NON-DEGREE", "SUST"]
    // let fulloptions = classSchema.obj.fulfills.enum
    // fulloptions.unshift('')

    //create route to search for classes
   
    let keys= Object.keys(classSchema.obj)
    
    
     //TODO: add search for credit category
    keys = keys.filter(ell=>{
        return ell != "credit_and_category"
    })
    // const index = keys.indexOf('credit_and_category')
    // if(index != -1){
    //     keys[index] = "credit category"
    // }
    res.render('catalogue/search', {keys, session:req.session})
})

//=============================
//POST Request Create Class
//=============================
router.post('/search', (req,res) =>{
    //console.log("REQ: ",req.body)
    //get search and display results
    //if name, fulfills, or place then direct search,
    let {searchcat, searchterm} = req.body
    //console.log(searchcat)
    if (["name", "place", "fulfills"].includes(searchcat)){
        let query = {}
        const re = new RegExp(`${searchterm}`, `i`)
        query[searchcat] = re
        Class.find(query)
        .then(foundClasses=>{
            console.log(query)      
            let foundClassesclone = [...foundClasses]
            //console.log(foundClassesclone)
            foundClassesclone.forEach(ell=>{
                ell.credit_and_category = objToString(ell.credit_and_category)
            })
            //console.log("GOT HERE")
            res.render('catalogue/results', {foundClasses: foundClassesclone, session: req.session})
            //console.log(res)

        })
        .catch(err=>{
            console.log('error searching name place for fulfills')
            res.redirect('/catalogue/search')
        })
    }


    //TODO if cred, then search in cred
    // router.post('/add', (req,res) =>{

    // })
    
})

//=============================
//PUT Request Add class to my 
//=============================
router.put('/search', (req,res) =>{
    console.log(req.session.userId)
    const Id = req.session.userId
    let {classname, semester} = req.body
    User.findById(Id)
    .then(user=>{
        let ob = {}
        ob["class"] = classname
        ob["semester"] = parseInt(semester)
        user.classes.push(ob)
        user.markModified()
        console.log(user)
        return user.save()

    })
    .then(done =>{
        setTimeout(() => res.redirect('/schedule'), 200)
    })
    .catch(error=>{
        console.log("Error adding class to user: ", error)
    })
    
    
})

//=============================
//GET Request show class 
//=============================
router.get('/:id', (req,res) =>{
    const classId = req.params.id

    Class.findById(classId)
        .then(classf=>{
            
            classf.credit_and_category = objToString(classf.credit_and_category)
            // classf.credit_and_category = classf.credit_and_cateogry.replaceAll('"{}', '')
            res.render('catalogue/show', {session: req.session, class:classf })
        })
        .catch(err=>{
            console.log(err)
            res.redirect('/catalogue')
        })
    
})

//=============================
//PUT Route Edit Class
//=============================
router.put('/:id', (req,res) =>{
    let classId = req.params.id
    let copy = {...req.body}
    let{name, place, cat1, cred1, cat2, cred2, cat3, cred3, fulfills} = copy
    let newClass = {
        name: name,
        place: place,
        credit_and_category: {
            [cat1]: parseInt(cred1)
        }
    }
    if(cat2 != ''){
        newClass.credit_and_category[cat2] = parseInt(cred2)
    }
    if(cat3 != ''){
        newClass.credit_and_category[cat3] = parseInt(cred3)
    }
    if(fulfills != ''){
        newClass['fulfills'] = fulfills
    }

    Class.findByIdAndUpdate(classId, newClass, {new:true})
        .then(classf=>{
            res.redirect( `/catalogue/${classf._id}`)

        })
        .catch(err=>{
            console.log("ERROR EDITING CLASS: ", err)
        })
})


module.exports = router