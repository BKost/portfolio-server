const express = require("express");
const router = express.Router();

const {
  addToCart,
  deleteFromCart,
  deleteShoppingCart,
} = require("../controllers/shopping-cart");

router.route("/").post(addToCart);
router.route("/delete-item/:itemId").delete(deleteFromCart);
router.route("/delete-cart").delete(deleteShoppingCart);

module.exports = router;
