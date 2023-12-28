const { ObjectId } = require("mongodb");
const { db } = require("../db/connectDB");
const bcrypt = require("bcryptjs");
const users = db.collection("users");
const items = db.collection("items");

const getProfile = async (req, res) => {
  // const { id } = req.params;

  const { userId } = req.user;

  try {
    let userData = await users.findOne({ _id: new ObjectId(userId) });

    delete userData.password;

    res.status(200).json({ msg: "User profile data", userData });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Something went wrong - get user profile info" });
  }
};

const updateProfile = async (req, res) => {
  const { userId } = req.user;

  let data = req.body;
  // console.log(data);

  const {
    user_name,
    last_name,
    first_name,
    phone,
    password,
    confirm_password,
    email,
    address,
  } = data;

  // check if all fields are filled

  if (!user_name || !last_name || !first_name || !phone || !email) {
    return res.status(400).json({ msg: "Fill out all required fields" });
  }

  if (password || confirm_password) {
    if (password !== confirm_password) {
      return res
        .status(400)
        .json({ msg: "Password you provided doesn t match" });
    }

    delete data.confirm_password;

    // !!!!!!!!!!!
    // hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    data.password = hashedPassword;
  }

  if (!password || !confirm_password) {
    delete data.password;
    delete data.confirm_password;

    // You STopped Here
  }

  const entries = Object.entries(address);

  let isAddressComplete = false;

  entries.forEach(([key, value]) => {
    if (!value) {
      return (isAddressComplete = false);
    }
    return (isAddressComplete = true);
  });

  data = { ...data, isAddressComplete };

  try {
    delete data._id;

    const updateUser = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: data }
    );
    console.log(updateUser);

    res.status(200).json({ msg: "Updated user profile", data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong - update user profile" });
  }
};

const deleteProfile = async (req, res) => {
  const { id } = req.params;

  console.log(id);

  try {
    const deleteUser = await users.deleteOne({ _id: new ObjectId(id) });
    const deleteUserItems = await items.deleteMany({ createdBy: id });

    // CLear cookies of deleted user

    console.log(deleteUser);
    console.log(deleteUserItems);

    res.status(200).json({ msg: "Profile deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong - delete profile" });
  }

  // res.send("Delete Profile");
};

module.exports = { deleteProfile, updateProfile, getProfile };
