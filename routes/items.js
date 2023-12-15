const express = require("express");
const router = express.Router();

const { getAllItems, getSingleItem } = require("../controllers/items");

router.route("/").get(getAllItems);
router.route("/:id").get(getSingleItem);

module.exports = router;