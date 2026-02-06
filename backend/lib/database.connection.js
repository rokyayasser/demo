const Database = require("../config/database");

const setupDatabase = async () => {
  try {
    await Database.connect();
    console.log("✅ Database connection established");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
};

module.exports = {
  setupDatabase,
  getConnectionStatus: () => Database.getConnectionStatus(),
  disconnect: () => Database.disconnect(),
};
