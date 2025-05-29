require('dotenv').config()
const { MongoClient, Int32, Double } = require("mongodb");

const uri = process.env.DB_URL;
const client = new MongoClient(uri);

async function runTests() {
  try {
    await client.connect();
    const db = client.db("codebrewmartDB");

    const users = db.collection("users");
    const products = db.collection("products");
    const orders = db.collection("orders");

    console.log("\n====================");
    console.log("🧪 CRUD TESTING START");
    console.log("====================");

    // ✅ CREATE TEST USER
    console.log("\n📌 Creating test user...");
    const newUser = {
      _id: new Int32(1006),
      name: "Test User",
      email: "test.user@example.com",
      wishlist: ["prod004", "prod010"]
    };
    await users.insertOne(newUser);
    console.table([newUser]);

    // ✅ CREATE TEST PRODUCT
    console.log("\n📌 Adding test product...");
    const newProduct = {
      _id: "prod9999",
      name: "Test Product - Coffee Mug",
      category: "Office",
      price: new Double(12.5),
      seller_id: "seller002",
      stock: new Int32(30)
    };
    await products.insertOne(newProduct);
    console.table([newProduct]);

    // ✅ READ TEST
    console.log("\n📖 Reading inserted test product...");
    const productBefore = await products.findOne({ _id: "prod9999" });
    console.table([productBefore]);

    // ✅ UPDATE TEST
    console.log("\n✏️ Updating test product stock (stock - 5)...");
    await products.updateOne({ _id: "prod9999" }, { $inc: { stock: -5 } });
    const productAfter = await products.findOne({ _id: "prod9999" });

    console.log("🔄 Stock Change:");
    console.table([
      {
        Product: "Test Product - Coffee Mug",
        Before: productBefore.stock,
        After: productAfter.stock
      }
    ]);

    // ✅ DELETE TEST
    console.log("\n🗑️ Deleting test product...");
    await products.deleteOne({ _id: "prod9999" });
    const deletedCheck = await products.findOne({ _id: "prod9999" });
    console.log("✅ Product deleted:", deletedCheck === null);

    // ✅ CONSISTENCY TEST: User -> Order
    console.log("\n🔁 Creating order for test user...");
    const newOrder = {
      _id: "order9999",
      user_id: new Int32(1006),
      items: [
        { product_id: "prod004", qty: new Int32(1) },
        { product_id: "prod010", qty: new Int32(1) }
      ],
      order_time: new Date(),
      total: new Double(104.98), // 89.99 + 14.99
      status: "paid",
      payment_method: "credit"
    };
    await orders.insertOne(newOrder);

    const refUser = await users.findOne({ _id: 1006 });
    const relatedOrders = await orders.find({ user_id: 1006 }).toArray();

    console.log("🔍 Consistency Check:");
    console.table([
      {
        "User Exists": !!refUser,
        "Order Count": relatedOrders.length
      }
    ]);

    //advanced test cases
   await testEdgeCaseInserts(db)
   await testBulkOperations(db)
   await testReferenceIntegrity(db)

   console.log("\n✅ All tests completed successfully.\n");

  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    await client.close();
  }

}

async function testEdgeCaseInserts(db) {
  const products = db.collection("products");

  console.log("\n🚧 Edge Case Insert Tests");

  try {
    console.log("Attempting to insert product with negative price...");
    await products.insertOne({
      _id: "prod_bad_1",
      name: "Broken Item",
      category: "Error",
      price: new Double(-10.0),
      seller_id: "seller001",
      stock: new Int32(5)
    });
  } catch (err) {
    console.error("✅ Rejected invalid price:", err.message);
  }

  try {
    console.log("Attempting to insert product with missing required field...");
    await products.insertOne({
      _id: "prod_bad_2",
      category: "Missing Name",
      price: new Double(10),
      seller_id: "seller001",
      stock: new Int32(5)
    });
  } catch (err) {
    console.error("✅ Rejected missing name:", err.message);
  }
}

async function testBulkOperations(db) {
  const products = db.collection("products");

  console.log("\n📦 Bulk Operations Test");

  await products.insertMany([
    { _id: "prod_bulk_1", name: "Bulk Item 1", category: "Test", price: new Double(5.0), seller_id: "seller001", stock: new Int32(5) },
    { _id: "prod_bulk_2", name: "Bulk Item 2", category: "Test", price: new Double(15.0), seller_id: "seller001", stock: new Int32(5) }
  ]);

  const result = await products.bulkWrite([
    { updateOne: { filter: { _id: "prod_bulk_1" }, update: { $set: { stock: new Int32(10) } } } },
    { deleteOne: { filter: { _id: "prod_bulk_2" } } }
  ]);

  console.table(result.result);
}

async function testReferenceIntegrity(db) {
  const orders = db.collection("orders");
  const users = db.collection("users");
  const products = db.collection("products");

  console.log("\n🔗 Reference Integrity Check");

  const sampleOrder = await orders.findOne({});
  if (!sampleOrder) return console.log("⚠️ No orders found to test.");

  const userId = sampleOrder.user_id instanceof Int32
    ? sampleOrder.user_id
    : new Int32(sampleOrder.user_id);

  const user = await users.findOne({ _id: userId });

  const missingItems = [];
  for (const item of sampleOrder.items || []) {
    const exists = await products.findOne({ _id: item.product_id });
    if (!exists) missingItems.push(item.product_id);
  }

  console.log("🔍 User Reference Found:", !!user);
  console.log("🔍 Products Found:", sampleOrder.items.length - missingItems.length);
  console.log("❌ Missing Products:", missingItems.length ? missingItems : "None");
}

runTests();