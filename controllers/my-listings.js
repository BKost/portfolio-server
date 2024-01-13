const { ObjectId } = require("mongodb");
const { db } = require("../db/connectDB");
const collection = db.collection("items");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

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

  const isImage = mimetype.startsWith("image");

  if (!isImage) {
    return res
      .status(400)
      .json({ msg: "Please upload an image, not any other format" });
  }

  async function uploadImageCloudinary(buffer, itemId, originalname) {
    const folderPath = path.join(__dirname, "../temp");

    fs.mkdir(folderPath, (err) => {
      if (err) {
        console.log("Error making folder");
      }
    });

    const filePath = `${folderPath}/${originalname}`;

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.log("Err writing a file");
      }
    });

    try {
      const imageFilePath = path.join(__dirname, "../temp", originalname);

      const imageId = `${userId}-${itemId}`;

      const result = await cloudinary.uploader.upload(imageFilePath, {
        public_id: imageId,
        folder: "uploads",
        resource_type: "image",
      });

      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err, "Error deleteing file");
        }
        fs.rmdir(folderPath, (err) => {
          if (err) {
            console.log(err);
            console.log("Err deleting temp folder");
          }
        });
      });

      // console.log(result);
    } catch (error) {
      console.log(error);

      return res
        .status(500)
        .json({ msg: "Error - uploading image to cloudinary" });
    }
  }

  data = {
    ...data,

    createdBy: userId,
  };

  try {
    const { insertedId: itemId } = await collection.insertOne(data);

    const imagePathWithItemId = `http://res.cloudinary.com/dqrbs7uav/image/upload/uploads/${userId}-${itemId}`;

    await collection.findOneAndUpdate(
      {
        _id: new ObjectId(itemId),
      },
      { $set: { image: imagePathWithItemId } }
    );

    uploadImageCloudinary(buffer, itemId, originalname);

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

  async function replaceImageCloudinary(buffer, originalname) {
    try {
      const folderPath = path.join(__dirname, "../temp");

      const filePath = `${folderPath}/${originalname}`;

      fs.mkdir(folderPath, (err) => {
        if (err) {
          return console.log("Error making folder");
        }

        fs.writeFile(filePath, buffer, (err) => {
          if (err) {
            console.log("Err writing a file");
          }
        });
      });

      const imageFilePath = path.join(__dirname, "../temp", originalname);

      const imageId = `uploads/${userId}-${listingId}`;

      cloudinary.api.resource(imageId, (error, result) => {
        if (error) {
          console.error("Error finding existing image:", error);
        } else {
          console.log("Existing image details:", result);

          cloudinary.uploader.upload(
            imageFilePath,
            { public_id: imageId, overwrite: true, invalidate: true },
            (error, result) => {
              if (error) {
                console.error("Error uploading new image:", error);
              } else {
                console.log("New image uploaded successfully:", result);
                fs.unlink(filePath, (err) => {
                  if (err) {
                    console.log(err, "Error deleteing file");
                  }
                  fs.rmdir(folderPath, (err) => {
                    if (err) {
                      console.log(err);
                      console.log("Err deleting temp folder");
                    }
                  });
                });
              }
            }
          );
        }
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ msg: "Error updating post - image upload" });
    }
  }

  try {
    if (req.file) {
      const { mimetype, buffer, originalname } = req.file;

      const isImage = mimetype.startsWith("image");

      if (!isImage) {
        return res
          .status(400)
          .json({ msg: "Please upload an image, not any other format" });
      }

      replaceImageCloudinary(buffer, originalname);

      const extension = mimetype.split("/")[1];

      const imagePathWithItemId = `http://res.cloudinary.com/dqrbs7uav/image/upload/v1705071564/uploads/${userId}-${listingId}.${extension}`;

      data = {
        ...data,
        image: imagePathWithItemId,
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
  const { userId } = req.user;

  try {
    await collection.deleteOne({
      _id: new ObjectId(listingId),
    });

    const imageId = `uploads/${userId}-${listingId}`;

    cloudinary.uploader.destroy(
      imageId,
      {
        resource_type: "image",
        invalidate: true,
      },
      (err, result) => {
        if (err) {
          console.log(err, "Error deleting image");
        } else {
          console.log(result, "Result of deleting image");
        }
      }
    );

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
