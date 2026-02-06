//Connect with db
const mongoose = require("mongoose");

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME, // This is the only one you need
    })
    .then((conn) => {
      console.log(`Database Connected: ${conn.connection.name}`);
    })
    .catch((err) => {
      console.error(`Database Error: ${err}`);
      process.exit(1);
    });
};

module.exports = dbConnection;