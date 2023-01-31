const mongoose = require("mongoose");
// console.log("Hey is this working !!");

require("dotenv").config();

const connectDB = async () => {
  // const conn = await mongoose.connect(process.env.MONGO_URI, {
  //   const conn = await mongoose.connect(process.env.MONGO_URI, {
  console.log(process.env.MONGO_URI);
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connnected : ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.log(`Error : ${error.message}`.red.bold);
    process.exit();
  }
};
module.exports = connectDB;
