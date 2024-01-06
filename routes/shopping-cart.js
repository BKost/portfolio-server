const express = require("express");
const router = express.Router();

const { addToCart, deleteFromCart } = require("../controllers/shopping-cart");

router.route("/").post(addToCart);
router.route("/:itemId").delete(deleteFromCart);

module.exports = router;
