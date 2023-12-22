const express = require("express");
const router = express.Router();

const path = require("path");

const multer = require("multer");

const {
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
  uploadListing,
} = require("../controllers/my-listings");

const uploadsPath = path.join(__dirname, "../uploads");

const upload = multer();

// const { getAllItems, getSingleItem } = require("../controllers/categories");

router
  .route("/")
  .get(getAllListings)
  .post(upload.single("image"), uploadListing);
router
  .route("/:listingId")
  .get(getSingleListing)
  .patch(updateListing)
  .delete(deleteListing);

module.exports = router;
