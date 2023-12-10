const getAllItems = async (req, res) => {
  res.send("Get All Items");
};

const getSingleItem = async (req, res) => {
  res.send("Get Single Item");
};

module.exports = { getAllItems, getSingleItem };
