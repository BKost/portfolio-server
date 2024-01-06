const express = require("express");
const router = express.Router();

const {
  createPaymentIntent,
  emailConfirmation,
} = require("../controllers/stripe");

router.route("/").post(createPaymentIntent);
router.route("/email").post(emailConfirmation);

module.exports = router;
