const { ObjectId } = require("mongodb");
const { db } = require("../db/connectDB");
const collection = db.collection("items");
const path = require("path");
const fs = require("fs");

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

  const { title, price, description } = req.body;

  let data = req.body;

  if (!req.file) {
    return res.status(400).json({ msg: "Please upload an image file" });
  }

  const { fieldname, originalname, encoding, mimetype, buffer } = req.file;

  const folderPath = path.join(__dirname, "../uploads");

  // const imageBuffer = Buffer.from();

  // check for correct image mimetype
  if (!title || !price || !description) {
    return res
      .status(400)
      .json({ msg: "Please fill out all fields in the form" });
  }

  const isImage = mimetype.startsWith("image");

  if (!isImage) {
    return res
      .status(400)
      .json({ msg: "Please upload an image, not any other format" });
  }

  // const extension = mimetype.split("/")[1];
  // const fileName = `${originalname}.${extension}`;

  // const fileName = `${itemId}-${originalname}`;

  function uploadImage(itemId) {
    const fileName = `${itemId}-${originalname}`;

    console.log(fileName);

    fs.writeFile(`${folderPath}/${fileName}/`, buffer, (err) => {
      if (err) {
        console.log("Error writing a file");
      }
    });
  }

  data = {
    ...data,

    createdBy: userId,
  };

  try {
    const { insertedId: itemId } = await collection.insertOne(data);

    const imagePathWithItemId = `/uploads/${itemId}-${originalname}`;

    await collection.findOneAndUpdate(
      {
        _id: new ObjectId(itemId),
      },
      { $set: { image: imagePathWithItemId } }
    );

    uploadImage(itemId);

    res.status(201).json({ msg: "New listing uploaded" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Something went wrong - upload listing / image" });
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

    // access uploads folder,
    //  loop through files,
    // delete one which name startsWith selected id

    const folderPath = path.join(__dirname, "../uploads");

    fs.readdir(folderPath, (err, files) => {
      if (err) {
        return console.log(err);
      }

      files.forEach((fileName) => {
        if (fileName.startsWith(listingId)) {
          return deleteImage(fileName);
        }
      });
    });

    function deleteImage(fileName) {
      const filePath = path.join(__dirname, "../uploads", fileName);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.log("Error when deleting an image");
          return res.status(500).json({ msg: "Error when deleting an image" });
        }
      });
    }

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
