const { db } = require("../db/connectDB");
const collection = db.collection("users");

const { CustomAPIError } = require("../errors/custom-error");

const bcrypt = require("bcryptjs");

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
    // const compare = await bcrypt.compare("password", hashed);
    // console.log(compare);

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

    // ADD If user name exists

    if (user) {
      throw new CustomAPIError(`User with email ${email} already exists`, 400);
    }

    const userName = await collection.findOne({ user_name });
    if (userName) {
      throw new CustomAPIError(`User name ${user_name} already taken`, 400);
    }

    // hash password
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(hashedPassword);

    registerUserData.password = hashedPassword;
    // Store hash in your password DB.
    await collection.insertOne(registerUserData);
    res.status(201).json({ msg: "User registered" });
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
