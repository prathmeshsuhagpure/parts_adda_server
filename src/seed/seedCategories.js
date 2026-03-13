require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const categoryData = require("../seed/categoryData");

const MONGO_URI = process.env.MONGO_URI;

const insertCategory = async (
  category,
  parent = null,
  level = 0,
  path = "",
) => {
  const created = await Category.create({
    name: category.name,
    parent,
    level,
  });

  const newPath = path ? `${path}/${created._id}` : `${created._id}`;

  await Category.findByIdAndUpdate(created._id, { path: newPath });

  if (category.children) {
    for (const child of category.children) {
      if (typeof child === "string") {
        const childCat = await Category.create({
          name: child,
          parent: created._id,
          level: level + 1,
        });

        await Category.findByIdAndUpdate(childCat._id, {
          path: `${newPath}/${childCat._id}`,
        });
      } else {
        await insertCategory(child, created._id, level + 1, newPath);
      }
    }
  }
};

const seedCategories = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    await Category.deleteMany();

    console.log("Old categories removed");

    for (const category of categoryData) {
      await insertCategory(category);
    }

    console.log("Categories seeded successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedCategories();
