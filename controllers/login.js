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
      return res.json({ msg: `User with mail ${email} does not exist` });
    }

    const { password: hashedPassword } = user;

    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordCorrect) {
      return res.json({ msg: `Provide correct password` });
    }

    // console.log(password);
    // console.log(hashedPassword);
    // console.log(isPasswordCorrect);

    const { user_name, _id } = user;

    const authToken = jwt.sign({ user_name, _id }, process.env.JWT_SIGN, {
      expiresIn: "1d",
    });

    const eightHours = 2880000;

    res.cookie("authToken", authToken, { maxAge: eightHours });
    res.cookie("user", { user_name, _id }, { maxAge: eightHours });

    // const decoded = jwt.verify(authToken, process.env.JWT_SIGN);
    // console.log(decoded);

    res.json({ msg: "Auth sent", authToken });
  } catch (error) {}
};

module.exports = { logIn };
