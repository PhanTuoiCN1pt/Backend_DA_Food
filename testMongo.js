const { MongoClient } = require("mongodb");

async function run() {
  try {
    const client = new MongoClient("mongodb://127.0.0.1:27017");
    await client.connect();
    console.log("✅ Connected to MongoDB");
    const db = client.db("food_app");
    console.log("Databases:", await client.db().admin().listDatabases());
    await client.close();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

run();
