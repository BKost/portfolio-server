require("dotenv").config();

const express = require("express");
const app = express();

// donnectDBr
const { connectToDatabase } = require("./db/connectDB");

// Middleware
const cookieParser = require("cookie-parser");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authMiddleware = require("./middleware/auth-middleware");

// Stripe payment

const stripe = require("stripe")(process.env.STRIPE_CLIENT_SECRET);

// const cors = require("cors");

// Routers
const categoriesRouter = require("./routes/items");
const myListingsRouter = require("./routes/my-listings");
const myProfileRouter = require("./routes/my-profile");

const { logIn } = require("./controllers/login");
const { register } = require("./controllers/register");
const { logOut } = require("./controllers/logout");

// {
//   origin: "http://localhost:3000",
//   credentials: true,
// }

// {
//   origin: "http://localhost:3000",
// }
// app.use(cors({ credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(`${__dirname}/uploads`));

app.post("/api/payment", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: "eur",
    });

    res.status(200).json({
      msg: "Payment intent sent",
      secretKey: paymentIntent.client_secret,
      secret: "123",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong - Payment intent" });
  }
});

app.post("/api/login", logIn);
app.post("/api/register", register);
app.get("/api/log-out", authMiddleware, logOut);

app.use("/api/items", categoriesRouter);
app.use("/api/my-listings", authMiddleware, myListingsRouter);
app.use("/api/my-profile", authMiddleware, myProfileRouter);

app.get("/", (req, res) => {
  res.send("Home");
});

// Route NOt Found
app.use(notFoundMiddleware);

// Custom Error Handler
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5100;

const start = async () => {
  try {
    await connectToDatabase();
    app.listen(port, console.log(`App listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
