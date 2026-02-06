// This file contains additional indexes for better query performance

const mongoose = require("mongoose");

module.exports = {
  // User model additional indexes
  userIndexes: [
    { name: "text", email: "text" },
    { role: 1, isActive: 1 },
    { createdAt: -1 },
  ],

  // Appointment model additional indexes
  appointmentIndexes: [
    { date: 1, time: 1, status: 1 },
    { userId: 1, status: 1, createdAt: -1 },
    { serviceId: 1, status: 1 },
    { paymobOrderId: 1 },
    { paymobTransactionId: 1 },
    { paymentDate: 1 },
    { adminConfirmed: 1 },
  ],

  // MedicalService model additional indexes
  medicalServiceIndexes: [
    { category: 1, available: 1 },
    { title: "text", title_ar: "text", description: "text" },
    { fees: 1 },
    { "meta.views": -1 },
    { "meta.bookings": -1 },
  ],

  // Create all indexes
  async createAllIndexes() {
    try {
      console.log("🔄 Creating database indexes...");

      // User indexes
      const User = require("./User");
      for (const index of this.userIndexes) {
        await User.collection.createIndex(index);
      }
      console.log("✅ User indexes created");

      // Appointment indexes
      const Appointment = require("./Appointment");
      for (const index of this.appointmentIndexes) {
        await Appointment.collection.createIndex(index);
      }
      console.log("✅ Appointment indexes created");

      // MedicalService indexes
      const MedicalService = require("./MedicalService");
      for (const index of this.medicalServiceIndexes) {
        await MedicalService.collection.createIndex(index);
      }
      console.log("✅ MedicalService indexes created");

      console.log("🎉 All indexes created successfully");
    } catch (error) {
      console.error("❌ Error creating indexes:", error);
    }
  },

  // Drop all indexes (for development/testing)
  async dropAllIndexes() {
    try {
      console.log("🔄 Dropping all indexes...");

      const collections = mongoose.connection.collections;
      for (const collectionName in collections) {
        const collection = collections[collectionName];
        await collection.dropIndexes();
        console.log(`✅ Indexes dropped for ${collectionName}`);
      }

      console.log("🎉 All indexes dropped");
    } catch (error) {
      console.error("❌ Error dropping indexes:", error);
    }
  },

  // Get index information
  async getIndexInfo() {
    try {
      const indexInfo = {};

      // User indexes
      const User = require("./User");
      indexInfo.user = await User.collection.getIndexes();

      // Appointment indexes
      const Appointment = require("./Appointment");
      indexInfo.appointment = await Appointment.collection.getIndexes();

      // MedicalService indexes
      const MedicalService = require("./MedicalService");
      indexInfo.medicalService = await MedicalService.collection.getIndexes();

      return indexInfo;
    } catch (error) {
      console.error("❌ Error getting index info:", error);
      return null;
    }
  },

  // Optimize queries
  getQueryOptimizationTips() {
    return {
      appointments: {
        findByDateAndStatus: "Use compound index: { date: 1, status: 1 }",
        findByUser: "Use index: { userId: 1, createdAt: -1 }",
        findBookedSlots: "Use index: { date: 1, time: 1, status: 1 }",
      },
      users: {
        search: "Use text index on name and email fields",
        findByRole: "Use index: { role: 1, isActive: 1 }",
      },
      medicalServices: {
        search: "Use text index on title and description fields",
        findByCategory: "Use index: { category: 1, available: 1 }",
        popularServices: 'Use index: { "meta.bookings": -1 }',
      },
      generalTips: [
        "Use selective indexes only on frequently queried fields",
        "Avoid indexing fields with low cardinality",
        "Use compound indexes for queries with multiple conditions",
        "Consider partial indexes for queries with specific conditions",
        "Monitor query performance with explain()",
      ],
    };
  },
};
