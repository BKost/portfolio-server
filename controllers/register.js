const { db } = require("../db/connectDB");
const collection = db.collection("users");

const { CustomAPIError } = require("../errors/custom-error");

const register = async (req, res) => {
  const registerUserData = req.body;

  const {
    user_name,
    first_name,
    last_name,
    phone,
    password,
    confirm_password,
    email,
    address,
  } = registerUserData;

  try {
    if (
      !user_name ||
      !first_name ||
      !last_name ||
      !password ||
      !confirm_password ||
      !email ||
      !phone ||
      !address
    ) {
      throw new CustomAPIError("Provide all necessary information", 400);
    }

    if (confirm_password !== password) {
      throw new CustomAPIError("Password doesn't match, try again", 400);
    }

    const user = await collection.findOne({ email });

    if (user) {
      throw new CustomAPIError(`User with email ${email} already exists`, 400);
    }

    if (!user) {
      await collection.insertOne(registerUserData);
      return res.status(201).json({ msg: "User registered" });
    }
  } catch (error) {
    if (error instanceof CustomAPIError) {
      return res.status(error.statusCode).json({ msg: `${error.message}` });
    }

    res.status(500).json({
      msg: `${error.message}` || "Something went wrong - Register user",
    });
  }
};

module.exports = { register };
