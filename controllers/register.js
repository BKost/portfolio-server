const { db } = require("../db/connectDB");
const collection = db.collection("users");
const transporter = require("../sendMail");
const { CustomAPIError } = require("../errors/custom-error");

const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  let registerUserData = req.body;
  // console.log(registerUserData);

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

  let data = {
    user_name,
    first_name,
    last_name,
    phone,
    password,
    email,
    address,
  };

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

    // console.log(typeof password, typeof confirm_password);

    if (confirm_password !== password) {
      throw new CustomAPIError("Password doesn't match, try again", 400);
    }

    const user = await collection.findOne({ email });

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
    // console.log(hashedPassword);

    // registerUserData.password = hashedPassword;
    data.password = hashedPassword;

    const entries = Object.entries(address);

    let isAddressComplete = false;

    entries.forEach(([key, value]) => {
      if (!value) {
        return (isAddressComplete = false);
      }
      return (isAddressComplete = true);
    });

    data = { ...data, isAddressComplete };

    // Store hash in your password DB.
    await collection.insertOne(data);

    // Send email about successful confirmation

    const message = {
      from: "my-project@server",
      to: "brenda.rempel44@ethereal.email",
      subject: `Registered new user: ${user_name}`,
      text: `Thank you for registering ${first_name} ${last_name}`,
      html: `<p >Thank you for registering ${first_name} ${last_name}</p>`,
    };

    transporter.sendMail(message, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ msg: "Error sending email" });
      }
    });

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
