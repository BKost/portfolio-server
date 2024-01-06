const stripe = require("stripe")(process.env.STRIPE_CLIENT_SECRET);
const { ObjectId } = require("mongodb");
const { db } = require("../db/connectDB");
const items = db.collection("items");
const shoppingCarts = db.collection("shopping-carts");
const transporter = require("../sendMail");

const createPaymentIntent = async (req, res) => {
  // calculate amount
  // recieve ids from local storage
  // get their price

  const { buyer } = req.body;
  const { cartId } = req.cookies;
  // console.log(buyer);
  if (!buyer) {
    return res.status(400).json({ msg: "Error - no buyer info and address" });
  }
  if (!cartId) {
    return res
      .status(500)
      .json({ msg: "Error finding a remote cart - no cartId" });
  }

  try {
    const cartObject = await shoppingCarts.findOne({
      _id: new ObjectId(cartId),
    });

    const { cart } = cartObject;

    function calculateAmount() {
      let total = 0;

      cart.forEach((item) => {
        total = total + Number(item.price);
      });

      console.log(total);

      return total;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateAmount(),
      currency: "eur",
    });

    // sent order confirmation mail

    console.log(paymentIntent.status);

    res.status(200).json({
      msg: "Payment intent sent",
      secretKey: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong - Payment intent" });
  }
};

const emailConfirmation = (req, res) => {
  const message = {
    from: "my-project@server",
    to: "brenda.rempel44@ethereal.email",
    subject: `Registered new user: ${user_name}`,
    text: `Thank you for registering ${first_name} ${last_name}`,
    html: "<p style:'color: red' >HTML vesrion of the message</p>",
  };

  // transporter.sendMail(message, (err) => {
  //   if (err) {
  //     console.log(err);
  //     return res.status(500).json({ msg: "Error sending email" });
  //   }
  // });

  console.log("Email sent");

  res.status(200).json({ msg: "Order confirmation sent successfully" });
};

module.exports = { createPaymentIntent, emailConfirmation };
