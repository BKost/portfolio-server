const express = require("express");
const router = express.Router();

const { deleteProfile, updateProfile } = require("../controllers/my-profile");

router.route("/:id").patch(updateProfile).delete(deleteProfile);

module.exports = router;
