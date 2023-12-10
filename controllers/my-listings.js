// My listings:
// - getAllItems
// - deleteItem
// - updateItem
// - uploadItem

const getAllListings = async (req, res) => {
  res.send("Get All Listings");
};

const getSingleListing = async (req, res) => {
  res.send("Get Single Listing");
};

const uploadListing = async (req, res) => {
  res.send("Upload listing");
};

const updateListing = async (req, res) => {
  res.send("Update listing");
};

const deleteListing = async (req, res) => {
  res.send("Delete listing");
};

module.exports = {
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
  uploadListing,
};
