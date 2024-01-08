const { db } = require("../db/connectDB");
const collection = db.collection("users");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// const jwtToken = jwt.sign({ foo: "bar" }, "shhhhh");

const logIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Povide Credentials" });
  }

  // { email: userEmail, password: userPassword }

  try {
    const user = await collection.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ msg: `User with mail ${email} does not exist` });
    }

    const { password: hashedPassword } = user;

    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordCorrect) {
      return res.status(400).json({ msg: `Provide correct password` });
    }

    const { user_name, _id } = user;

    const authToken = jwt.sign({ user_name, _id }, process.env.JWT_SIGN, {
      expiresIn: "1d",
    });

    const eightHours = 28800000;

    res.cookie("authToken", authToken, {
      maxAge: eightHours,

      httpOnly: true,
    });

    res.cookie("user", { user_name, _id }, { maxAge: eightHours });

    res.status(200).json({ msg: `User ${user_name} logged in` });
  } catch (error) {
    res.status(500).json({
      msg: `${err.message} - login` || "Something went wrong - login",
    });
  }
};

module.exports = { logIn };
