const { db } = require("../db/connectDB");
const collection = db.collection("users");

const logIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Povide Credentials" });
  }

  res.send("Log in");
};

module.exports = { logIn };
