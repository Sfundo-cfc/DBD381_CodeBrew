# CodeBrew Database Demo

A MongoDB-based project demonstrating database operations, functional testing, and load testing using Node.js and Artillery.

---

## Project Structure
- `functionaltest/crud_codebrew.js` – Functional test script for CRUD operations  
- `functionaltest/qry_codebrew.js` – Functional test script for query operations  
- `loadtest/load-test.yml` – Basic load test configuration for Artillery  
- `loadtest/load-test-complex-get.yml` – Load test with complex GET requests  
- `loadtest/load-test-multi-collection.yml` – Load test spanning multiple collections  
- `init_codebrew.js` – Script to initialize and seed the MongoDB database  
- `server.js` – Express.js server entry point  
- `package.json` – Node.js project metadata and dependencies  
- `.env` – Environment variables (e.g., MongoDB URI)

---

## Getting Started

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project folder
cd dbd381_codebrewnew

# Install dependencies
npm install
```

# Available Scripts

## Database Initialization

### Script: `init_codebrew.js`

This script initializes the `codebrewmartDB` MongoDB database. It drops any existing data, defines schema validation rules, inserts sample data, and creates indexes to optimize queries.

---

### Features

-  **Drops Existing Collections**: Cleans up old data to ensure consistent state.
- **Creates Collections with Validation**: Enforces structure using `$jsonSchema`.
-  **Imports Data** from `./data` directory:
  - `sellers.json`
  - `products.json`
  - `users.json`
  - `orders.json`
  - `reviews.json`
-  **Converts Data Types** to appropriate BSON types:
  - `Int32`, `Double`, `Date`
-  **Creates Indexes** for performance optimization:
  - Text and compound indexes for `products`
  - Indexes for sorting and filtering in `reviews`, `orders`, and `users`

---

###  How to Run

```bash
npm run init

```

## Functional Testing Script

###  Script: `crud_codebrew.js`

This script performs a series of **CRUD** and **functional tests** on the `codebrewmartDB` database. It helps validate schema correctness, referential integrity, and database behavior with edge cases and bulk operations.

---

###  Test Flow

```plaintext
1. Connect to MongoDB
2. Create test user and product
3. Read & update product
4. Delete product
5. Create order referencing user and wishlist
6. Run:
   - Edge Case Inserts
   - Bulk Operations
   - Reference Integrity Checks
7. Disconnect from MongoDB
```

###  How to Run

```bash
npm run crud

```

## MongoDB Query Script

###  Script: `qry_codebrew.js`

This script performs a series of **read-only analytics and reporting queries** on the `codebrewmartDB` database. It's ideal for dashboards, admin reports, and business intelligence validations.

---

###  Query Overview

```plaintext
1. Products by category
2. Products sorted by price
3. Full-text search
4. Orders by user
5. Out-of-stock products
6. Users by wishlisted product
7. Top 3 best-selling products
8. Average ratings per product
9. Orders not yet delivered
10. Orders from the last 7 days
11. Total revenue calculation
12. Order counts per user
13. Avg rating for specific product
14. Top 5 best-selling products
```

###  How to Run

```bash
npm run qry

```

#  Load Testing & Performance Evaluation

This document outlines how we simulated high-load environments using **Artillery** and structured our **Express.js** server to handle concurrent users. It also documents the outcomes of our scalability and performance tests as part of **Task 9** and **Task 11** of our NoSQL-based e-commerce project.

---

##  Simulation & Server Setup

###  Load Simulation with Artillery

We used [Artillery](https://artillery.io/) to simulate high-concurrency traffic on our API endpoints, such as `/products`, `/orders`, `/users`, and `/reviews`.

**Test Configurations:**
- **Arrival rates**: 10–51 virtual users per second
- **Duration**: 60 seconds
- **Scenarios**: Normal, paginated, and multi-collection queries
- **Metrics collected**: Response time, success rates, throughput

Example scenario:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: Fetch Products
    flow:
      - get:
          url: "/products"
```

##  How to Run

### Normal test
```bash
npm run loadtest1

```

### Complex Get test
```bash
npm run loadtest2

```

### Multi-Collection test
```bash
npm run loadtest3

```

## 🛠️ Express.js Server Setup

Our backend uses **Node.js** with **Express.js** to handle RESTful requests. Routes were created for each core entity:

- `GET /products`
- `GET /orders`
- `GET /users`
- `GET /reviews`

**Example route handler:**

```js
app.get('/products', async (req, res) => {
  try {
    const products = await db.collection('products')
      .find({})
      .limit(50)
      .toArray();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

###  How to Run
```bash
npm run dev

```

## Technologies Used

The following technologies were utilized in the development of this project:
* Node.js (v22+)
* Express.js (v5+)
* MongoDB (v6+)
* Git & GitHub
* nodemon (for live development)
