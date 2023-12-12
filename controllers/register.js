const { db } = require("../db/connectDB");
const collection = db.collection("users");

const register = async (req, res) => {
  // register user info:
  // -first name, last name
  // -user name
  // -phone
  // email
  // password, confirm password
  //

  const body = req.body;
  const { first_name, last_name, phone, password, confirm_password, email } =
    req.body;

  console.log(body);

  try {
    if (
      !first_name ||
      !last_name ||
      !password ||
      !confirm_password ||
      !email ||
      !phone
    ) {
    }

    const result = await collection.find({}).toArray();
    console.log(result);
  } catch (error) {}

  res.send("Register");
};

module.exports = { register };
