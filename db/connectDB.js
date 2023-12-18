const { MongoClient } = require("mongodb");

const dbClient = new MongoClient(process.env.MONGO_URI);

const db = dbClient.db("FULLSTACK-PROJECT");

// const getDB = (dbName) => {
//   return dbClient.db(dbName);
// };

const connectToDatabase = async () => {
  try {
    await dbClient.connect();
  } catch (error) {
    await dbClient.close();
    console.log(`Error connecting to database: ${error}`);
  }
};

module.exports = {
  dbClient,
  connectToDatabase,
  db,
  // getDB,
};
