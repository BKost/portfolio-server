const { ObjectId } = require("mongodb");
const { db } = require("../db/connectDB");
const users = db.collection("users");
const items = db.collection("items");

const updateProfile = async (req, res) => {
  const { id } = req.params;

  const data = req.body;

  console.log(data);

  // SPECIAL ATTENTION !!!

  try {
    // const updateUser = await users.updateOne(
    //   { _id: new ObjectId(id) },
    //   { $set: {} }
    // );
  } catch (error) {}

  console.log(id);

  res.send("Update Profile");
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

module.exports = { deleteProfile, updateProfile };
