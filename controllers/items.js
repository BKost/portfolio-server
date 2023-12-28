const { ObjectId } = require("mongodb");
const { db } = require("../db/connectDB");
const items = db.collection("items");

const getAllItems = async (req, res) => {
  try {
    const allItems = await items.find({}).toArray();

    res.status(200).json({ allItems, count: allItems.length });

    // console.log(items);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong - get all items" });
  }
};

const getAllCategoryItems = async (req, res) => {
  const { category } = req.params;

  try {
    const itemsArr = await items.find({ category }).toArray();

    res.status(200).json({ msg: "Category items", itemsArr });

    // console.log(items);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong - get all items" });
  }
};

const getSingleItem = async (req, res) => {
  const { id } = req.params;

  try {
    const singleItem = await items.findOne({
      _id: new ObjectId(id),
      // _id: new ObjectId(id),
    });

    res.status(200).json({ singleItem });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong - get single item" });
  }
};

module.exports = { getAllItems, getSingleItem, getAllCategoryItems };
