const mongoose =require('./connection')
const Class = require('./class')
const Major = require('./major')
const db = mongoose.connection
const startClasses = require('./seedcatalogue.js')

db.on('open', () =>{
    Major.deleteMany({})
    .then((deletedMajors) =>{
        console.log("Deleted Major")

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