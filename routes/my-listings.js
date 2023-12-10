const express = require("express");
const router = express.Router();

const {
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
  uploadListing,
} = require("../controllers/my-listings");

// const { getAllItems, getSingleItem } = require("../controllers/categories");

router.route("/").get(getAllListings).post(uploadListing);
router
  .route("/:id")
  .get(getSingleListing)
  .patch(updateListing)
  .delete(deleteListing);

module.exports = router;
