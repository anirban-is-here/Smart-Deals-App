const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// mongoDB connection string smartdb1001  smartdbUser
const uri =
  "mongodb+srv://smartdbUser:smartdb1001@cluster0.lpak3ak.mongodb.net/?appName=Cluster0";

// MongoDB Client Setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("smart_db");

    // products collection
    const productsCollection = db.collection("products");

    // bids collection
    const bidsCollection = db.collection("bids");

    //user collection
    const usersCollection = db.collection("users");
    // get all users
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    // add a user
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const query = { email: newUser.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.status(409).send({ message: "User already exists" });
      }
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    // API Endpoints
    // Query to find all products or by email---------------------------------------------------------------------------------
    app.get("/products", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query.email = req.query.email;
        console.log(query.email);
      }
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });
    // GET API to fetch a single product by ID----------------------------------------------------------------------------
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // get product by email
    // app.get("/myProducts/email/:email", async (req, res) => {
    //   const mail = req.params.email;

    //   const query = { email: mail };
    //   const result = await productsCollection.find(query).toArray();
    //   console.log(result.length);
    //   res.send(result);
    // });
    // POST API to add a product-------------------------------------------------------------------------------------
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });
    // Delete API to remove a product by ID----------------------------------------------------------------------------
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
    // PATCH API to update a product by ID-------------------------------------------------------------
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: id };
      const updateDoc = {
        $set: {
          status: updatedProduct.status,
        },
      };
      const result = await productsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // PUT API to update a product by ID-------------------------------------------------------------
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id; // product ID from URL
      const updatedProduct = req.body; // full product object

      if (!updatedProduct || Object.keys(updatedProduct).length === 0) {
        return res
          .status(400)
          .send({ message: "Updated product data is required" });
      }

      try {
        const filter = { _id: id }; // string _id
        const options = { upsert: false }; // don't create a new product if not exists

        // Replace the entire document
        const result = await productsCollection.replaceOne(
          filter,
          updatedProduct,
          options
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Product not found" });
        }

        res.send({ message: "Product fully updated", result });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
      }
    });

    // Bids api-----------------------------Bids api---------------------------------------------
    // ----------------Get all bid------------------------------------------------------------
    app.get("/bids", async (req, res) => {
      const result = await bidsCollection.find().toArray();
      res.send(result);
    });

    // -----------------POST Bid----------------
    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });

    // Delete API to remove a bid by ID----------------------------------------------------------------------------
    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Smart Deals Server is running on port: ${port}`);
});
