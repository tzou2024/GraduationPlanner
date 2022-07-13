const express = require('express')

//importing fruit model to access database
const User = require('../models/user')

//bcrypt is used to hash(encrypt) passwords
const bcrypt = require('bcryptjs')
const { Error } = require('mongoose')

const router = express.Router()


//=============================
// GET Request Signup
//=============================
router.get('/signup', (req,res) =>{
    res.render('users/signup')
})


//=============================
// POST Request Signup
//=============================
router.post('/signup', async (req,res) =>{
    console.log('inital singup body', req.body)

    req.body.password = await bcrypt.hash(
        req.body.password,
        await bcrypt.genSalt(10)
    )

    //now that our password is hashed we can create a user

    User.create(req.body)
        //if created successfully, redirect tol ogin page
        .then(user =>{
            console.log("new user: ", user)
            res.redirect('/users/login')
        })
        //if unsuccessful, send erre
        .catch(error => {
            console.log(error)
            res.json(error)
        })
})

//=============================
// GET Request Login
//=============================
router.get('/login', (req,res) =>{ 
    res.render('users/login')
})

//=============================
// POST Request Login
//=============================
//we can add an r u sure is there is time
router.post('/login', async (req, res) =>{
    const {username, password} = req.body

    console.log('username: ', username)
    console.log('password: ', password)
    console.log(req.session)

    User.findOne({ username })
        .then(async (user) =>{
            if (user) {
                //compare pw
                //bcrypt.compare evaluates to a truthy or falsy value
                const result = await bcrypt.compare(password, user.password)

                if (result) {
                    req.session.username = username
                    req.session.loggedIn = true
                    req.session.userId = user._id
                    console.log(req.session)
                    res.redirect('/classes')
                }

                else {
                    console.log("incorect username or password")
                    res.redirect('/users/login')
                }

            }
            else {
                console.log("user does not exist")
                res.redirect('/users/login')
            }

        })
        .catch(error=>{
            console.log("DB LOGIN ERROR: ", error)
            res.redirect('/users/login')
        })
    //first we find the user, 

    //if exist,  and compare password use newly created session object
    //if don't redirect to singup page


})

//=============================
// GET Request Logout
//=============================
router.get('/logout', (req,res) =>{
    //destroy session and redirect to main page
    req.session.destroy(err=>{
        console.log("Logout error: ", err)
        console.log("session has been destroyed")
        console.log("session", req.session)
        res.redirect('/users/login')
    })
})


module.exports = router