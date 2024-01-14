const stripe = require("stripe")(process.env.STRIPE_CLIENT_SECRET);
const { ObjectId } = require("mongodb");
const { db } = require("../db/connectDB");
const shoppingCarts = db.collection("shopping-carts");
const transporter = require("../sendMail");

const createPaymentIntent = async (req, res) => {
  const { buyer } = req.body;
  const { cartId } = req.cookies;

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

      return total;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateAmount(),
      currency: "eur",
    });

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
  const { buyerInfo, amount } = req.body;

  const { first_name, last_name, email, address, phone } = buyerInfo;

  const message = {
    from: "my-project@server",
    // email is hardcoded for ethereal testing
    to: "brenda.rempel44@ethereal.email",
    subject: `Order confirmation for ${first_name} ${last_name} `,
    text: `Your order will arrive soon. \n Payment: ${amount}$ \n Delivery address:\n Name: ${first_name} ${last_name} \n Phone number:  ${phone} \n Email: ${email} \n Street: ${address.street_name} ${address.street_number}, \n City: ${address.city}`,
    html: `<p> Your order will arrive soon. \n Payment: ${amount}$ \n Delivery address:\n Name: ${first_name} ${last_name} \n Phone number:  ${phone} \n Email: ${email} \n Street: ${address.street_name}, \n City: ${address.city}</p>`,
  };

  transporter.sendMail(message, (err) => {
    if (err) {
      return res.status(500).json({ msg: "Error sending email" });
    }
  });

  res.status(200).json({ msg: "Order confirmation sent successfully" });
};

module.exports = { createPaymentIntent, emailConfirmation };
