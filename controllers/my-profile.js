const updateProfile = async (req, res) => {
  res.send("Update Profile");
};
const deleteProfile = async (req, res) => {
  res.send("Delete Profile");
};

module.exports = { deleteProfile, updateProfile };
