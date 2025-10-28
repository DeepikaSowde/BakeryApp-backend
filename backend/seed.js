const mongoose = require("mongoose");
const Product = require("./models/Product");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const seedProducts = [
  {
    name: "Chocolate Cake",
    price: 25.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.53.39.jpeg",
    description: "Delicious chocolate cake with rich frosting.",
  },
  {
    name: "Croissant",
    price: 3.5,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.54.33.jpeg",
    description: "Flaky and buttery croissant.",
  },
  {
    name: "Blueberry Muffin",
    price: 4.0,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.55.11.jpeg",
    description: "Fresh blueberry muffin.",
  },
  {
    name: "Vanilla Cupcake",
    price: 3.25,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.55.48.jpeg",
    description: "Classic vanilla cupcake with buttercream.",
  },
  {
    name: "Strawberry Tart",
    price: 18.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.56.33.jpeg",
    description: "Fresh strawberry tart with custard filling.",
  },
  {
    name: "Chocolate Chip Cookies",
    price: 2.5,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.57.28.jpeg",
    description: "Chewy chocolate chip cookies.",
  },
  {
    name: "Red Velvet Cake",
    price: 28.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.58.11.jpeg",
    description: "Moist red velvet cake with cream cheese frosting.",
  },
  {
    name: "Apple Pie",
    price: 15.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.58.30.jpeg",
    description: "Traditional apple pie with cinnamon.",
  },
  {
    name: "Banana Bread",
    price: 8.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.59.07.jpeg",
    description: "Moist banana bread with walnuts.",
  },
  {
    name: "Lemon Bars",
    price: 4.5,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 16.59.33.jpeg",
    description: "Tangy lemon bars with powdered sugar.",
  },
  {
    name: "Pound Cake",
    price: 12.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.00.18.jpeg",
    description: "Rich and dense pound cake.",
  },
  {
    name: "Brownies",
    price: 3.75,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.01.41.jpeg",
    description: "Fudgy chocolate brownies.",
  },
  {
    name: "Cheesecake",
    price: 22.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.02.33.jpeg",
    description: "Creamy cheesecake with berry topping.",
  },
  {
    name: "Danish Pastry",
    price: 4.25,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.03.23.jpeg",
    description: "Flaky Danish pastry with fruit filling.",
  },
  {
    name: "Carrot Cake",
    price: 26.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.03.36.jpeg",
    description: "Spiced carrot cake with cream cheese frosting.",
  },
  {
    name: "Scones",
    price: 3.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.04.19.jpeg",
    description: "Buttery scones perfect with tea.",
  },
  {
    name: "Tiramisu",
    price: 19.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.04.31.jpeg",
    description: "Classic Italian tiramisu dessert.",
  },
  {
    name: "Macarons",
    price: 2.0,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.05.49.jpeg",
    description: "Delicate French macarons in various flavors.",
  },
  {
    name: "Bread Pudding",
    price: 9.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.06.14.jpeg",
    description: "Warm bread pudding with vanilla sauce.",
  },
  {
    name: "Cinnamon Rolls",
    price: 5.5,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.06.35.jpeg",
    description: "Soft cinnamon rolls with icing.",
  },
  {
    name: "Fruit Tart",
    price: 16.99,
    imagePath:
      "C:/Users/kaviv/OneDrive/Desktop/mythilipic/WhatsApp Image 2025-09-16 at 17.07.23.jpeg",
    description: "Colorful fruit tart with custard base.",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.deleteMany({});

    for (const productData of seedProducts) {
      if (fs.existsSync(productData.imagePath)) {
        const imageBuffer = fs.readFileSync(productData.imagePath);
        const filename = path.basename(productData.imagePath);

        // For now, store image as base64 string instead of GridFS due to compatibility issues
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString(
          "base64"
        )}`;

        // Create product
        const product = new Product({
          name: productData.name,
          price: productData.price,
          image: base64Image,
          description: productData.description,
        });

        await product.save();
      }
    }

    console.log("Database seeded!");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedDB();
