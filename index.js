require('dotenv').config();
const express = require('express')
const cors = require('cors')
const app = express()
const port =process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());


// start mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;

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

app.get('/jobs/:id',async (req, res)=>{
  const id= req.params.id;
  const query={_id:new ObjectId(id)}
  const result = await jobsCollection.findOne(query);
  res.send(result)


})

app.post('/jobs', async (req, res) => {
  try {
    const job = req.body;
    const result = await jobsCollection.insertOne(job);
    res.send(result);
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).send("Error adding job");
  }
});

app.put('/jobs/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const options = { upsert: true };
    const updatedJob = req.body;
    const job = {
      $set: updatedJob
    };
    const result = await jobsCollection.updateOne(filter, job, options);
    res.send(result);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).send("Error updating job");
  }
});

app.delete('/jobs/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await jobsCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).send("Error deleting job");
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
