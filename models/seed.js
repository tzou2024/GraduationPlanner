const mongoose =require('./connection')
const Class = require('./class')
const db = mongoose.connection
const startClasses = require('./seeddata.js')

db.on('open', () =>{
    Class.deleteMany({})
    .then((deletedClasses) =>{
        console.log("Deleted Classes")

        Class.create(startClasses)
            .then(data =>{
                console.log("SEEDED")
                db.close()
            })
            .catch(error=>{
                console.log("ERROR SEEDING: ", error)
                db.close()
            })
    })
    .catch((err) =>{
        console.log("ERR Deleting for Seed: ", err)
        db.close()
    })

})