require('dotenv').config()
const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const port = 3000;

const uri = process.env.DB_URL;
const client = new MongoClient(uri);

app.use(express.json()); // Middleware for parsing JSON bodies

// Helper: Get pagination options from query string
function getPagination(req) {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  return { skip, limit };
}

// Connect to DB once at startup
async function startServer() {
  try {
    await client.connect();
    const db = client.db("codebrewmartDB");

    // GET /products
    app.get("/products", async (req, res) => {
      try {
        const { skip, limit } = getPagination(req);
        const products = await db.collection("products").find().skip(skip).limit(limit).toArray();
        res.json(products);
      } catch (err) {
        res.status(500).json({ error: err.toString() });
      }
    });

    // GET /users
    app.get("/users", async (req, res) => {
      try {
        const { skip, limit } = getPagination(req);
        const users = await db.collection("users").find().skip(skip).limit(limit).toArray();
        res.json(users);
      } catch (err) {
        res.status(500).json({ error: err.toString() });
      }
    });

    // GET /orders
    app.get("/orders", async (req, res) => {
      try {
        const { skip, limit } = getPagination(req);
        const orders = await db.collection("orders").find().skip(skip).limit(limit).toArray();
        res.json(orders);
      } catch (err) {
        res.status(500).json({ error: err.toString() });
      }
    });

    // GET /reviews
    app.get("/reviews", async (req, res) => {
      try {
        const { skip, limit } = getPagination(req);
        const reviews = await db.collection("reviews").find().skip(skip).limit(limit).toArray();
        res.json(reviews);
      } catch (err) {
        res.status(500).json({ error: err.toString() });
      }
    });

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

startServer();
