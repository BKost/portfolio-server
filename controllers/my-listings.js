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

  let data = req.body;

  const { title, price, description, category } = req.body;

  if (!title || !price || !description || !category) {
    return res
      .status(400)
      .json({ msg: "Please fill out all fields in the form" });
  }

  if (!req.file) {
    return res.status(400).json({ msg: "Please upload an image file" });
  }

  const { fieldname, originalname, encoding, mimetype, buffer } = req.file;

  const folderPath = path.join(__dirname, "../uploads");

  const isImage = mimetype.startsWith("image");

  if (!isImage) {
    return res
      .status(400)
      .json({ msg: "Please upload an image, not any other format" });
  }

  // const extension = mimetype.split("/")[1];
  // const fileName = `${originalname}.${extension}`;

  // const fileName = `${itemId}-${originalname}`;
  // const fileName = `${itemId}-${userId}-${originalname}`;

  function uploadImage(itemId) {
    const fileName = `${itemId}-${userId}-${originalname}`;

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

    const imagePathWithItemId = `/uploads/${itemId}-${userId}-${originalname}`;

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
  const { userId } = req.user;

  let data = req.body;

  const { title, price, description, category } = req.body;

  if (!title || !price || !description || !category) {
    return res.status(400).json({ msg: "Fill out all required fields" });
  }

  const folderPath = path.join(__dirname, "../uploads");

  function findAndDeleteOldImage() {
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
  }

  function deleteImage(fileName) {
    const filePath = path.join(__dirname, "../uploads", fileName);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("Error when deleting an image");
        return res.status(500).json({ msg: "Error when deleting an image" });
      }
    });
  }
  //
  //
  //

  function uploadNewImage(buffer, itemId, originalname) {
    const fileName = `${itemId}-${userId}-${originalname}`;

    fs.writeFile(`${folderPath}/${fileName}/`, buffer, (err) => {
      if (err) {
        console.log("Error writing a file");
      }
    });
  }

  // delete old image
  // upload new image
  // upload image uri path

  try {
    if (req.file) {
      const { mimetype, buffer, originalname } = req.file;

      const isImage = mimetype.startsWith("image");

      if (!isImage) {
        return res
          .status(400)
          .json({ msg: "Please upload an image, not any other format" });
      }

      findAndDeleteOldImage();
      uploadNewImage(buffer, listingId, originalname);

      data = {
        ...data,
        image: `/uploads/${listingId}-${userId}-${originalname}`,
      };

      await collection.updateOne(
        {
          _id: new ObjectId(listingId),
        },
        { $set: data }
      );

      return res.status(200).json({ msg: `Listing updated`, data });
    }

    await collection.updateOne(
      {
        _id: new ObjectId(listingId),
      },
      { $set: data }
    );

    return res.status(200).json({ msg: `Listing updated`, data });
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
