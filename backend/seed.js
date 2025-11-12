const mongoose = require("mongoose");
const Product = require("./models/Product");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ encoding: "utf16le" });

const seedProducts = [
  {
    name: "Coconut Cookies",
    price: 300,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.53.39.jpeg",
    description: "Delicious chocolate cake with rich frosting.",
  },
  {
    name: "Kitkat Cake",
    price: 300,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.54.33.jpeg",
    description: "Flaky and buttery croissant.",
  },
  {
    name: "Mabel Cookies",
    price: 400,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.55.11.jpeg",
    description: "Fresh blueberry muffin.",
  },
  {
    name: "Tutti Frutti Cake",
    price: 300,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.55.48.jpeg",
    description: "Classic vanilla cupcake with buttercream.",
  },
  {
    name: "Hot Milk Tea Cake",
    price: 300,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.56.33.jpeg",
    description: "Fresh strawberry tart with custard filling.",
  },
  {
    name: "Mutta mithai",
    price: 250,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.57.28.jpeg",
    description: "Chewy chocolate chip cookies.",
  },
  {
    name: "Butter Cookies",
    price: 300,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.58.30.jpeg",
    description: "Traditional apple pie with cinnamon.",
  },
  {
    name: "Oats Cookies",
    price: 8.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.59.07.jpeg",
    description: "Moist banana bread with walnuts.",
  },
  {
    name: "Ragi nuts cookies",
    price: 300,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.59.33.jpeg",
    description: "Tangy lemon bars with powdered sugar.",
  },
  {
    name: "Cheese Cake",
    price: 300,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.00.18.jpeg",
    description: "Rich and dense pound cake.",
  },
  {
    name: "Ragi Brownie",
    price: 300,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.01.41.jpeg",
    description: "Fudgy chocolate brownies.",
  },
  {
    name: "Birthday cake",
    price: 200,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.02.33.jpeg",
    description: "Creamy cheesecake with berry topping.",
  },

  {
    name: "Red Velvet Cake",
    price: 300,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.03.36.jpeg",
    description: "Spiced carrot cake with cream cheese frosting.",
  },
  {
    name: "Chocolate cake",
    price: 200,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.04.31.jpeg",
    description: "Classic Italian tiramisu dessert.",
  },
  {
    name: "Peanut Cookies",
    price: 200,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.05.49.jpeg",
    description: "Delicate French macarons in various flavors.",
  },
  {
    name: "Ragi Chocochip Cookies",
    price: 500,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.06.14.jpeg",
    description: "Warm bread pudding with vanilla sauce.",
  },
  {
    name: "Pizza",
    price: 900,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.06.35.jpeg",
    description: "Soft cinnamon rolls with icing.",
  },
  {
    name: "wheat Donut",
    price: 16.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.07.23.jpeg",
    description: "Colorful fruit tart with custard base.",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Initialize GridFSBucket
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    await Product.deleteMany({});
    console.log("Deleted existing products");

    for (const productData of seedProducts) {
      console.log(`Seeding product: ${productData.name}`);
      if (fs.existsSync(productData.imagePath)) {
        console.log(`Image exists for ${productData.name}`);

        // Read image file
        const imageBuffer = fs.readFileSync(productData.imagePath);
        const filename = path.basename(productData.imagePath);

        // Upload to GridFSBucket using promise
        const file = await new Promise((resolve, reject) => {
          const uploadStream = bucket.openUploadStream(filename, {
            contentType: "image/jpeg",
          });

          uploadStream.on("finish", () => {
            console.log(
              `Uploaded image for ${productData.name}, file ID: ${uploadStream.id}`
            );
            resolve({ _id: uploadStream.id });
          });

          uploadStream.on("error", reject);
          uploadStream.write(imageBuffer);
          uploadStream.end();
        });

        // Create product with GridFS file ID
        const product = new Product({
          name: productData.name,
          price: productData.price,
          image: file._id,
          description: productData.description,
        });

        await product.save();
        console.log(`Saved product: ${productData.name}`);
      } else {
        console.log(`Image not found for ${productData.name}, skipping`);
      }
    }

    console.log("Database seeded!");
    process.exit();
  } catch (error) {
    console.log("Error:", error);
    process.exit(1);
  }
};

seedDB();
