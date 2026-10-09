const jwt = require('jsonwebtoken');
const Faculty = require('../models/faculty.model');
const ApiError = require("../utils/ApiError");
const Student = require('../models/student.model');

async function resetPassword(newPassword, token) {
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(400, "Invalid or expired reset link");
  }
  if (payload.purpose !== "reset") throw new ApiError(400, "Invalid or expired reset link");

  const Model = payload.role === "faculty" ? Faculty : Student;
  const user = await Model.findById(payload.id);
  if (!user) throw new ApiError(400, "Invalid or expired reset link");

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
}

module.exports = resetPassword;