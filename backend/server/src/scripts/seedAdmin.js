import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME,
  });

  const user = new User({
    name: "Admin Demo",
    email: "admin@example.com",
    password: "Admin@123",
    role: "manager",
  });
  
  await user.save();

  console.log("Seeded user:", user.userId, user.email);
  process.exit();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});