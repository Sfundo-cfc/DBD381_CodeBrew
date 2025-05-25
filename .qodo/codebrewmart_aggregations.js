use codebrewmartDB;

// 1. Most bought item per seller
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.product_id",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $group: {
      _id: { seller: "$product.seller_id", product: "$product.name" },
      total_sold: { $sum: "$items.qty" }
    }
  },
  { $sort: { "_id.seller": 1, total_sold: -1 } }
]);

// 2. Top-selling products in a given month
db.orders.aggregate([
  {
    $match: {
      order_time: {
        $gte: ISODate("2025-05-01T00:00:00Z"),
        $lte: ISODate("2025-05-31T23:59:59Z")
      }
    }
  },
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.product_id",
      total_sold: { $sum: "$items.qty" }
    }
  },
  { $sort: { total_sold: -1 } },
  { $limit: 5 }
]);

// 3. Total sales per seller
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.product_id",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $group: {
      _id: "$product.seller_id",
      total_sales: {
        $sum: { $multiply: ["$items.qty", "$product.price"] }
      }
    }
  }
]);

// 4. Basic product recommendations
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$user_id",
      products: { $addToSet: "$items.product_id" }
    }
  },
  { $unwind: "$products" },
  {
    $group: {
      _id: "$products",
      also_bought_with: { $addToSet: "$products" }
    }
  }
]);

// 5. Ratings and Likes Summary per Product
db.reviews.aggregate([
  {
    $group: {
      _id: "$product_id",
      avg_rating: { $avg: "$rating" },
      total_likes: { $sum: "$likes" },
      total_reviews: { $sum: 1 }
    }
  },
  { $sort: { avg_rating: -1, total_reviews: -1 } }
]);
