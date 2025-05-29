require('dotenv').config()
const { MongoClient } = require("mongodb");

const uri = process.env.DB_URL;
const client = new MongoClient(uri);

async function runQueries() {
  try {
    await client.connect();
    const db = client.db("codebrewmartDB");

    // Products by category
    const electronics = await db.collection("products").find({ category: "Electronics" }).toArray();
    console.log("\n📦 Electronics Products:");
    console.table(electronics);

    // Products sorted by price
    const sorted = await db.collection("products").find().sort({ price: -1 }).toArray();
    console.log("\n💰 Products Sorted by Price:");
    console.table(sorted.map(p => ({ name: p.name, price: p.price })));

    // Full-text search (requires text index)
    const searchResults = await db.collection("products").find({ $text: { $search: "keyboard" } }).toArray();
    console.log("\n🔍 Search for 'keyboard':");
    console.table(searchResults.map(p => ({ name: p.name, category: p.category })));

    // Orders by user
    const ordersForUser = await db.collection("orders").find({ user_id: 1001 }).toArray();
    console.log("\n🧾 Orders for User 1001:");
    console.table(ordersForUser);

    // Out of stock products
    const outOfStock = await db.collection("products").find({ stock: { $lte: 0 } }).toArray();
    console.log("\n⚠️ Out of Stock Products:");
    console.table(outOfStock);

    // Users who wishlisted a specific product
    const wishlisted = await db.collection("users").find({ wishlist: "prod004" }).toArray();
    console.log("\n💡 Users with 'prod004' in Wishlist:");
    console.table(wishlisted.map(u => ({ name: u.name, email: u.email })));

    // Top 3 best-selling products
    const top3 = await db.collection("orders").aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product_id", totalSold: { $sum: "$items.qty" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 3 }
    ]).toArray();
    console.log("\n🏆 Top 3 Best-Selling Products:");
    console.table(top3);

    // Average rating per product
    const avgRatings = await db.collection("reviews").aggregate([
      { $group: { _id: "$product_id", avgRating: { $avg: "$rating" } } },
      { $sort: { avgRating: -1 } }
    ]).toArray();
    console.log("\n⭐ Average Rating by Product:");
    console.table(avgRatings);

    // Orders not delivered
    const notDelivered = await db.collection("orders").find({ status: { $ne: "delivered" } }).toArray();
    console.log("\n🚚 Orders Not Yet Delivered:");
    console.table(notDelivered.map(o => ({ _id: o._id, status: o.status })));

    // Orders from the last 7 days
    const recentOrders = await db.collection("orders").find({
      order_time: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).toArray();
    console.log("\n📅 Orders in Last 7 Days:");
    console.table(recentOrders.map(o => ({ _id: o._id, date: o.order_time })));

    // Total revenue
    const revenue = await db.collection("orders").aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]).toArray();
    console.log("\n💸 Total Revenue:");
    console.table(revenue);

    // Orders per user
    const orderCounts = await db.collection("orders").aggregate([
      { $group: { _id: "$user_id", orderCount: { $sum: 1 } } },
      { $sort: { orderCount: -1 } }
    ]).toArray();
    console.log("\n📊 Orders per User:");
    console.table(orderCounts);

    // Average rating for prod1002
    const avgRating = await db.collection("reviews").aggregate([
      { $match: { product_id: "prod004" } },
      { $group: { _id: "$product_id", avgRating: { $avg: "$rating" } } }
    ]).toArray();
    console.log("\n🔍 Average Rating for prod002:");
    console.table(avgRating);

    // Top 5 best sellers
    const topProducts = await db.collection("orders").aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product_id", totalSold: { $sum: "$items.qty" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]).toArray();
    console.log("\n🏅 Top 5 Best-Selling Products:");
    console.table(topProducts);

  } catch (err) {
    console.error("❌ Query Test Failed:", err);
  } finally {
    await client.close();
  }
}

runQueries();