const mongoose = require("mongoose")

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB,{
            // useNewUrlParser:true,
            // useUnifiedTopology:true,
        });
        console.log("✅ MongoDb Connected")
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
module.exports = connectDB;