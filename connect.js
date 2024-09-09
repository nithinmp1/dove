const { MongoClient } = require('mongodb');

const url = 'mongodb://hbs-mongodb-1:27017';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db('yourDatabaseName');
    // Perform database operations
  } finally {
    await client.close();
    console.log("Connected correctly to server");

  }
}

run().catch(console.dir);