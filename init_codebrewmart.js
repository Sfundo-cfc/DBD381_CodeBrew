
use codebrewmartDB;

// Sellers
db.sellers.insertMany([
  { _id: "seller101", name: "BitBeans Co.", email: "beans@bitmail.dev" },
  { _id: "seller202", name: "DevGear Supply", email: "gear@devmail.io" }
]);

// Products
db.products.insertMany([
  {
    _id: "prod1001",
    name: "Code Hoodie - Dark Theme",
    category: "Apparel",
    price: 39.99,
    seller_id: "seller101",
    stock: 50
  },
  {
    _id: "prod1002",
    name: "Mechanical Keyboard - Silent Red",
    category: "Gear",
    price: 89.99,
    seller_id: "seller202",
    stock: 20
  },
  {
    _id: "prod1003",
    name: "Cold Brew Concentrate",
    category: "Beverages",
    price: 12.99,
    seller_id: "seller101",
    stock: 100
  }
]);

// Users
db.users.insertOne({
  _id: 9001,
  name: "Alex Dev",
  email: "alex@code.dev",
  wishlist: ["prod1001", "prod1003"]
});

// Orders
db.orders.insertOne({
  user_id: 9001,
  items: [
    { product_id: "prod1001", qty: 1 },
    { product_id: "prod1002", qty: 1 }
  ],
  order_time: new Date(),
  total: 129.98,
  status: "paid",
  payment_method: "credit"
});

// Create index and shard
db.orders.createIndex({ user_id: 1 });
sh.enableSharding("codebrewmartDB");
sh.shardCollection("codebrewmartDB.orders", { user_id: 1 });

// Reviews
db.reviews.insertOne({
  product_id: "prod1002",
  user_id: 9001,
  rating: 5,
  comment: "Keys are quiet and smooth!",
  likes: 12,
  timestamp: new Date()
});
