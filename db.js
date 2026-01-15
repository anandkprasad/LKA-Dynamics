const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI || 
  "";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  try {
    if (db) return db;

    await client.connect();
    db = client.db("DatabaseLKA");
    console.log("MongoDB connected");
    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // optional but recommended
  }
}


module.exports = connectDB;
