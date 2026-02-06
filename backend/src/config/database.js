const mongoose = require("mongoose");

class Database {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        console.log("✅ Using existing database connection");
        return;
      }

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 5,
      };

      console.log("🔗 Connecting to MongoDB...");

      const connection = await mongoose.connect(
        process.env.MONGODB_URI,
        options
      );

      this.isConnected = true;

      console.log(`✅ MongoDB Connected: ${connection.connection.name}`);
      console.log(`📊 Host: ${connection.connection.host}`);
      console.log(`🗂️  Database: ${connection.connection.name}`);

      // Handle connection events
      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️  MongoDB disconnected");
        this.isConnected = false;
      });

      mongoose.connection.on("reconnected", () => {
        console.log("🔄 MongoDB reconnected");
        this.isConnected = true;
      });

      return connection;
    } catch (error) {
      console.error("❌ Database connection error:", error);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log("✅ Database disconnected");
      }
    } catch (error) {
      console.error("❌ Error disconnecting from database:", error);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

module.exports = new Database();
