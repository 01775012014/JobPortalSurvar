const express = require('express')
const cors = require('cors')
const app = express()
const port =process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());


// start mongodb

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://AJobPortalSystem:khHk7sEhIRRuyZ6i@ajobportalsystem.voqxl1h.mongodb.net/?retryWrites=true&w=majority&appName=AJobPortalSystem";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let jobsCollection;

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    
    // jobsCollection = client.db('careerCode').collection('jobs');

    // এখন হবে
    jobsCollection = client.db('jobs').collection('jobs-data');

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Connect to DB before starting server
connectDB();

// jobs api
app.get('/jobs', async (req, res) => {
  try {
    if (!jobsCollection) {
      return res.status(500).send("Database not connected");
    }
    const cursor = jobsCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).send("Internal server error");
  }
});

// Close client on server shutdown
process.on('SIGINT', async () => {
  console.log("Closing MongoDB connection...");
  await client.close();
  process.exit(0);
});

// mongodb end


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
