// scripts/hash-passwords.js
// Run this ONCE to generate bcrypt hashes for your .env passwords
// Usage: node scripts/hash-passwords.js
// Then copy the output into your .env file

const bcrypt = require("bcrypt");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("\n🔐 Password Hasher for .env\n");
  console.log(
    "This generates bcrypt hashes to replace plaintext passwords in your .env\n",
  );

  const adminPass = await question(
    "Enter ADMIN_PASSWORD  (current plaintext): ",
  );
  const doctorPass = await question(
    "Enter DOCTOR_PASSWORD (current plaintext): ",
  );

  const ROUNDS = 12; // higher = slower but more secure
  console.log("\n⏳ Hashing... (this takes a few seconds)\n");

  const [adminHash, doctorHash] = await Promise.all([
    bcrypt.hash(adminPass.trim(), ROUNDS),
    bcrypt.hash(doctorPass.trim(), ROUNDS),
  ]);

  console.log("✅ Done! Replace these lines in your .env:\n");
  console.log(`ADMIN_PASSWORD=${adminHash}`);
  console.log(`DOCTOR_PASSWORD=${doctorHash}`);
  console.log("\n⚠️  Keep these hashes secret — never share your .env file\n");

  rl.close();
}

main().catch(console.error);
