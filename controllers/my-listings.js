const { ObjectId } = require("mongodb");
const { db } = require("../db/connectDB");
const collection = db.collection("items");

const getAllListings = async (req, res) => {
  const { userId } = req.user;
  try {
    const listings = await collection.find({ createdBy: userId }).toArray();

    res.status(200).json({ listings, count: listings.length });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong - get all listings" });
  }
};

const getSingleListing = async (req, res) => {
  const { listingId } = req.params;

  try {
    const singleListing = await collection.findOne({
      _id: new ObjectId(listingId),
    });

    res.status(200).json({ singleListing });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong - get single listing" });
  }
};

const uploadListing = async (req, res) => {
  const { userId } = req.user;

  let data = req.body;

  data = { ...data, createdBy: userId };

  try {
    await collection.insertOne(data);

    res.status(201).json({ msg: "New listing uploaded" });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong - upload listing" });
  }
};

const updateListing = async (req, res) => {
  const { listingId } = req.params;

  const data = req.body;

  // console.log(data);
  // console.log(listingId);

  // NEEDS MORE WORK !!!

  try {
    await collection.updateOne(
      {
        _id: new ObjectId(listingId),
      },
      { $set: data }
    );

    res.status(200).json({ msg: `Listing updated` });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong - get single listing" });
  }
};

const deleteListing = async (req, res) => {
  const { listingId } = req.params;

  try {
    await collection.deleteOne({
      _id: new ObjectId(listingId),
    });

    res.status(200).json({ msg: "Listing deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Something went wrong - delete single listing" });
  }
};

module.exports = {
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
  uploadListing,
};
