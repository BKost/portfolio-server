const { db } = require("../db/connectDB");
const collection = db.collection("users");

const jwt = require("jsonwebtoken");
const jwtToken = jwt.sign({ foo: "bar" }, "shhhhh");

const logIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Povide Credentials" });
  }

  // { email: userEmail, password: userPassword }

  try {
    const user = await collection.findOne({ email, password });

    if (!user) {
      return res.json("Invalid credentials - Wrong email or password");
    }

    res.json({ msg: "Auth sent" });
  } catch (error) {}
};

module.exports = { logIn };
