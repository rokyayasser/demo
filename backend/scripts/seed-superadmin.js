// scripts/seed-superadmin.js
// Run this ONCE to create the first superadmin account in MongoDB.
// After this, manage all admins from the admin panel.
//
// Usage:
//   node scripts/seed-superadmin.js
//
// Or with custom values:
//   ADMIN_NAME="Ahmed" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="yourpass" node scripts/seed-superadmin.js

require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (q) => new Promise((r) => rl.question(q, r));

async function main() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME || "DoctorDB",
  });
  console.log("✅ Connected to MongoDB\n");

  const Admin = require("../src/models/Admin");

  // Check if any admin exists
  const count = await Admin.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  ${count} admin(s) already exist in the database.`);
    const answer = await ask("Create another superadmin anyway? (y/n): ");
    if (answer.toLowerCase() !== "y") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  // Get credentials
  const name = process.env.ADMIN_NAME || (await ask("Admin name: "));
  const email = process.env.ADMIN_EMAIL || (await ask("Admin email: "));
  const password =
    process.env.ADMIN_PASSWORD || (await ask("Admin password: "));

  // Check if email already used
  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`❌ An admin with email "${email}" already exists.`);
    process.exit(1);
  }

  // Create superadmin (password hashed by pre-save hook)
  const admin = await Admin.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: password.trim(),
    role: "superadmin",
    active: true,
  });

  console.log("\n✅ Superadmin created successfully!");
  console.log(`   Name:  ${admin.name}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}`);
  console.log(
    "\nYou can now log in to the admin panel with these credentials.",
  );
  console.log("To add more admins, use the admin panel → Admin Management.\n");

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
