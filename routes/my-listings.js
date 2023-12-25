const express = require("express");
const router = express.Router();

const multer = require("multer");

const {
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
  uploadListing,
} = require("../controllers/my-listings");

const upload = multer();

router
  .route("/")
  .get(getAllListings)
  .post(upload.single("image"), uploadListing);

router
  .route("/:listingId")
  .get(getSingleListing)
  .patch(upload.single("image"), updateListing)
  .delete(deleteListing);

module.exports = router;
