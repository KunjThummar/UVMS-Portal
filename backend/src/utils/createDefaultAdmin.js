const bcrypt = require("bcrypt");
const Administrator = require("../models/admin.model");

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await Administrator.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log("Default admin already exists.");
      return;
    }

    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    await Administrator.create({
      fullName: process.env.ADMIN_FULL_NAME,
      email: process.env.ADMIN_EMAIL,
      passwordHash,
    });

    console.log("Default admin created successfully.");
  } catch (error) {
    console.log("Error creating default admin:", error.message);
  }
};

module.exports = createDefaultAdmin;