const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI || 
  "mongodb+srv://admin:admin@databaselka.aadk0uw.mongodb.net/DatabaseLKA?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  if (db) return db;

  await client.connect();
  db = client.db("DatabaseLKA");
  console.log("MongoDB connected");
  return db;
}

module.exports = connectDB;
