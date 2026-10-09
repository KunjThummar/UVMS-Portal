const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

const generateResetPasswordToken = (id, role , purpose) => {
  return jwt.sign(
    {
      id,
      role,
      purpose
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};



module.exports = {generateToken , generateResetPasswordToken}