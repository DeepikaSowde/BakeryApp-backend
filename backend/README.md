# Bakery App Backend

This is the backend server for the Bakery App, built with Node.js, Express, and MongoDB with GridFS for image storage.

## Features

- Product management with images and prices stored in MongoDB using GridFS
- RESTful API for retrieving and uploading product data

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up MongoDB:
   - Install MongoDB locally or use a cloud service like MongoDB Atlas.
   - Update the `MONGO_URI` in `.env` if needed.

3. Seed the database with sample products:
   ```
   npm run seed
   ```

4. Start the server:
   ```
   npm start
   ```
   Or for development:
   ```
   npm run dev
   ```

## API Endpoints

- GET /api/products - Retrieve all products with images as base64 data URLs
- POST /api/products/upload - Upload a new product with image (form-data: name, price, description, image file)

## Product Schema

Each product has:
- name: String (required)
- price: Number (required)
- image: ObjectId (GridFS file reference, required)
- description: String (optional)
- createdAt: Date
- updatedAt: Date
