const { ObjectId } = require("mongodb");
const { db } = require("../db/connectDB");

const carts = db.collection("shopping-carts");

const addToCart = async (req, res) => {
  // once clicked on add to cart:
  // - new cart object will be created in db
  // - cookie with cart object _id will be sent
  // -

  const { itemData } = req.body;
  const { cartId } = req.cookies;

  const cartItem = { ...itemData, cartItemId: new ObjectId() };

  try {
    if (!cartId) {
      const { insertedId } = await carts.insertOne({ cart: [cartItem] });
      const cartId = insertedId.toString();

      const shoppingCart = await carts.findOne({
        _id: new ObjectId(insertedId),
      });

      const eightHours = 28800000;
      res.cookie("cartId", cartId, { httpOnly: true, maxAge: eightHours });

      return res
        .status(201)
        .json({ msg: "Shopping cart created", shoppingCart });
    }

    const shoppingCart = await carts.findOneAndUpdate(
      {
        _id: new ObjectId(cartId),
      },
      { $push: { cart: cartItem } },
      { returnDocument: "after" }
    );

    res.status(200).json({ msg: "Shopping cart updated", shoppingCart });
  } catch (error) {
    res.status(500).json({ msg: "Error - Add to cart" });
  }
};

const deleteFromCart = async (req, res) => {
  const { cartId } = req.cookies;
  const { itemId } = req.params;

  if (!cartId) {
    return res
      .status(400)
      .json({ msg: "Error deleting item from remote cart - no cartId" });
  }

  try {
    const shoppingCart = await carts.findOneAndUpdate(
      { _id: new ObjectId(cartId) },
      { $pull: { cart: { cartItemId: new ObjectId(itemId) } } },
      { returnDocument: "after" }
    );

    res.status(200).json({ msg: "Item deleted from cart", shoppingCart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error deleting item from remote cart" });
  }
};

module.exports = { addToCart, deleteFromCart };
