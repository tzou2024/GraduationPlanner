
require('dotenv').config()
const mongoose = require('mongoose')

const DATABASE_URI = process.env.DATABASE_URI

const config = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(DATABASE_URI, config)

mongoose.connection
//handle the opening of the connections
//running code block on open
    //console.logging a string
    .on('open', () =>console.log('Connected to Mongoose'))
    //running a codeblock on close
    .on('close', () => console.log('Disconnected from mongoose'))
    //handle any errors that might happen
    .on('error', (err) =>console.error(err))

module.exports = mongoose