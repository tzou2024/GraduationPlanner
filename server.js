//=============================
// import dependencies
//=============================

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const methodOverride = require('method-override')
const _ = require('lodash')

//=============================
// import routes
//=============================
const userRoutes = require('./controller/user_routes')
const catalogueRoutes = require('./controller/catalogue_routes')

const scheduleRoutes = require('./controller/schedule_routes')

const majorRoutes = require('./controller/major_routes')


//=============================
// Create our express application object
//=============================
const app = require('liquid-express-views')(express())

//=============================
// Middleware
//=============================

// this is for request logging
app.use(morgan('tiny'))
app.use(methodOverride('_method'))
// parses urlencoded request bodies
app.use(express.urlencoded({ extended: false }))
// to serve files from public statically
app.use(express.static('public'))

//=============================
// Session Middleware
//=============================
const session = require('express-session')
const MongoStore = require('connect-mongo')

//heres the middleware that sets up our sessions
//sessions are a file that holds login info, is a collection in the database along with users and fruits
app.use(
	session(  {
		secret:process.env.SECRET,
		//where to store session
		store:MongoStore.create({
			mongoUrl: process.env.MONGODB_URI
		}),
		saveUninitialized: true,
		resave: false
	})
)




//=============================
// Routes
//=============================

app.use('/catalogue', catalogueRoutes)
//use user pathing
app.use('/users', userRoutes)
//use schedule pathing
app.use('/schedule', scheduleRoutes)

app.use('/major', majorRoutes)

app.get('/', (req, res) => {
	res.redirect('/users/login')
})

//=============================
// Open Ports
//=============================
const PORT = process.env.PORT
app.listen(process.env.PORT || 3000, () => {
	console.log(`app is listening on port: ${PORT}`)
})
