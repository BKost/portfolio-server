const express = require("express");
const router = express.Router();

const {
  deleteProfile,
  updateProfile,
  getProfile,
} = require("../controllers/my-profile");

router.route("/").get(getProfile).patch(updateProfile).delete(deleteProfile);

module.exports = router;
