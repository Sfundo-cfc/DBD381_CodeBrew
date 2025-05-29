require('dotenv').config()
const { MongoClient, Int32, Double } = require("mongodb");
const fs = require("fs");
const path = require("path");

const uri = process.env.DB_URL; // Replace with your Atlas URI
const client = new MongoClient(uri);

// Load JSON file from ./data folder
function loadData(fileName) {
  const filePath = path.join(__dirname, "data", fileName);
  const raw = fs.readFileSync(filePath);
  return JSON.parse(raw);
}

// Convert specified fields to BSON types
function convertTypes(docs, schemaMap) {
  return docs.map(doc => {
    for (const field in schemaMap) {
      if (doc[field] !== undefined) {
        if (schemaMap[field] === "Int32") {
          doc[field] = new Int32(doc[field]);
        } else if (schemaMap[field] === "Double") {
          doc[field] = new Double(doc[field]);
        }
      }
    }
    return doc;
  });
}

async function run() {
  try {
    await client.connect();
    const db = client.db("codebrewmartDB");

    // Drop collections if re-running
    const collections = ["sellers", "products", "users", "orders", "reviews"];
    for (const col of collections) {
      const exists = await db.listCollections({ name: col }).hasNext();
      if (exists) await db.collection(col).drop();
    }

    // Create collections with schema validators
    await db.createCollection("sellers", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["_id", "name", "email"],
          properties: {
            _id: { bsonType: "string" },
            name: { bsonType: "string" },
            email: { bsonType: "string", pattern: "^.+@.+$" }
          }
        }
      }
    });

    await db.createCollection("products", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["_id", "name", "category", "price", "seller_id", "stock"],
          properties: {
            _id: { bsonType: "string" },
            name: { bsonType: "string" },
            category: { bsonType: "string" },
            price: { bsonType: "double", minimum: 0 },
            seller_id: { bsonType: "string" },
            stock: { bsonType: "int", minimum: 0 }
          }
        }
      }
    });

    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["_id", "name", "email"],
          properties: {
            _id: { bsonType: "int" },
            name: { bsonType: "string" },
            email: { bsonType: "string", pattern: "^.+@.+$" },
            wishlist: {
              bsonType: "array",
              items: { bsonType: "string" }
            }
          }
        }
      }
    });

    await db.createCollection("orders", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_id", "items", "order_time", "total", "status", "payment_method"],
          properties: {
            user_id: { bsonType: "int" },
            items: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["product_id", "qty"],
                properties: {
                  product_id: { bsonType: "string" },
                  qty: { bsonType: "int", minimum: 1 }
                }
              }
            },
            order_time: { bsonType: "date" },
            total: { bsonType: "double", minimum: 0 },
            status: { enum: ["paid", "pending", "cancelled", "shipped", "delivered"] },
            payment_method: { enum: ["credit", "debit", "paypal", "crypto"] }
          }
        }
      }
    });

    await db.createCollection("reviews", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["product_id", "user_id", "rating", "timestamp"],
          properties: {
            product_id: { bsonType: "string" },
            user_id: { bsonType: "int" },
            rating: { bsonType: "int", minimum: 1, maximum: 5 },
            comment: { bsonType: "string" },
            likes: { bsonType: "int", minimum: 0 },
            timestamp: { bsonType: "date" }
          }
        }
      }
    });

    const sellers = loadData("sellers.json");
    await db.collection("sellers").insertMany(sellers);

    const rawProducts = loadData("products.json");
    const products = convertTypes(rawProducts, { price: "Double", stock: "Int32" });
    await db.collection("products").insertMany(products);

    const rawUsers = loadData("users.json");
    const users = convertTypes(rawUsers, { _id: "Int32" });
    await db.collection("users").insertMany(users);

    const rawOrders = loadData("orders.json");
    const orders = rawOrders.map(order => ({
      ...order,
      user_id: new Int32(order.user_id),
      order_time: new Date(order.order_time),
      total: new Double(order.total),
      items: order.items.map(i => ({ product_id: i.product_id, qty: new Int32(i.qty) }))
    }));
    await db.collection("orders").insertMany(orders);

    const rawReviews = loadData("reviews.json");
    const reviews = rawReviews.map(r => ({
      ...r,
      user_id: new Int32(r.user_id),
      rating: new Int32(r.rating),
      likes: new Int32(r.likes),
      timestamp: new Date(r.timestamp)
    }));
    await db.collection("reviews").insertMany(reviews);

    // Continue with indexing and aggregation queries
    console.log("✅ Data imported from JSON files.");

    // Create indexes
    await db.collection("products").createIndex({ category: 1 });
    await db.collection("products").createIndex({ category: 1, price: 1 });
    await db.collection("products").createIndex({ name: "text" });
    await db.collection("reviews").createIndex({ product_id: 1 });
    await db.collection("reviews").createIndex({ product_id: 1, rating: -1 });
    await db.collection("orders").createIndex({ user_id: 1, order_time: -1 });
    await db.collection("reviews").createIndex({ product_id: 1, timestamp: -1 });
    await db.collection("orders").createIndex({ user_id: 1, status: 1 });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("products").createIndex({ seller_id: 1 });

  } catch (err) {
    console.error("❌ Initialization failed:", err);
  } finally {
    await client.close();
  }
}

run();