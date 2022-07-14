const mongoose =require('./connection')
const Class = require('./class')
const db = mongoose.connection

db.on('open', () =>{
    Class.deleteMany({})
    .then((deletedClasses) =>{
        console.log("Deleted Users")
        db.close()
    })
    .catch((err) =>{
        console.log("ERR Deleting Users: ", err)
        db.close()
    })

})