const express = require("express");
const router = express.Router();

const {
  getAllItems,
  getSingleItem,
  getAllCategoryItems,
} = require("../controllers/items");

router.route("/").get(getAllItems);
router.route("/categories/:category").get(getAllCategoryItems);
router.route("/:id").get(getSingleItem);

module.exports = router;
