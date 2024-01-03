const logOut = async (req, res) => {
  res.cookie("authToken", "deleted", { maxAge: 0 });
  res.status(200).json({ msg: "You have been logged out" });
};

module.exports = { logOut };
