const { ObjectId } = require("mongodb");
const { db } = require("../db/connectDB");
const collection = db.collection("items");

const getAllItems = async (req, res) => {
  try {
    const items = await collection.find({}).toArray();

    res.status(200).json({ items, count: items.length });

    // console.log(items);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong - get all items" });
  }
};

const getSingleItem = async (req, res) => {
  const { id } = req.params;

  try {
    const singleItem = await collection.findOne({
      _id: new ObjectId("657c40920348c428b0b9613f"),
      // _id: new ObjectId(id),
    });

    res.status(200).json({ singleItem });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong - get single item" });
  }
};

module.exports = { getAllItems, getSingleItem };
