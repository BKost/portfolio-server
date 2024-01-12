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

  async function uploadImageCloudinary(itemId) {
    const folderPath = path.join(__dirname, "../temporary-upload");

    fs.writeFile(`${folderPath}/${originalname}`, buffer, (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ msg: "Error writing a file - temporary-uploads" });
      }
    });

    const imageToUpload = path.join(
      __dirname,
      "../temporary-upload/",
      originalname
    );

    try {
      const imageId = `${userId}-${itemId}`;

      const result = await cloudinary.uploader.upload(imageToUpload, {
        public_id: imageId,
        folder: "uploads",
      });

      console.log(result);

      fs.unlink(imageToUpload, (err) => {
        if (err) {
          console.log(err);
        }
      });
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

    const imagePathWithItemId = `http://res.cloudinary.com/dqrbs7uav/image/upload/v1705071564/uploads/${userId}-${itemId}`;

    await collection.findOneAndUpdate(
      {
        _id: new ObjectId(itemId),
      },
      { $set: { image: imagePathWithItemId } }
    );

    // uploadImage(itemId);
    uploadImageCloudinary(itemId);

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

  async function replaceImageCloudinary(buffer, originalname) {
    const folderPath = path.join(__dirname, "../temporary-upload/");

    fs.writeFile(`${folderPath}/${originalname}`, buffer, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          msg: "Error writing a file - temporary-uploads - replace image",
        });
      }
    });

    try {
      const prefix = `uploads/${userId}`;

      const { resources } = await cloudinary.api.resources({
        type: "upload",
        prefix: prefix,
      });

      resources.find((item) => {
        const { public_id } = item;

        if (public_id.includes(listingId)) {
          const imageToUpload = path.join(
            __dirname,
            "../temporary-upload/",
            originalname
          );

          cloudinary.uploader
            .upload(imageToUpload, {
              public_id,
              overwrite: true,
            })

            .then((response) => {
              console.log(response);
              const filePath = path.join(
                __dirname,
                "../temporary-upload/",
                originalname
              );

              fs.unlink(filePath, (err) => {
                if (err) {
                  console.log(err);
                  return res.status(500).json({
                    msg: "Error updating post - image upload - deleting temporary file",
                  });
                }
              });
            })
            .catch((err) => {
              console.log(err);
              return res.status(500).json({
                msg: "Error updating post - image upload",
              });
            });
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
      console.log(req.file);

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
