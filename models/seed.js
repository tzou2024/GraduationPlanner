const mongoose =require('./connection')
const Class = require('./class')
const db = mongoose.connection

db.on('open', () =>{
    const startClasses = [
       {
           name: "QEA1", 
           credit_and_category: {
               "MTH": 1,
               "SCI": 1,
               "ENGR": 1
           }
       },
       {
        name: "Design Nature",
        credit_and_category: {
            "ENGR": 4
        }
        },
        {
            name: "Identity", 
            credit_and_category: {
                "AHS": 4
            },

    }
    ]
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