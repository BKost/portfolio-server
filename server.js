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

// const cors = require("cors");

// Routers
const categoriesRouter = require("./routes/items");
const myListingsRouter = require("./routes/my-listings");
const myProfileRouter = require("./routes/my-profile");
const shoppingCartRouter = require("./routes/shopping-cart");
const stripeRouter = require("./routes/stripe");

const { logIn } = require("./controllers/login");
const { logOut } = require("./controllers/logout");
const { register } = require("./controllers/register");

const { clearStaleCarts } = require("./controllers/shopping-cart");
// const { addToCart } = require("./controllers/shopping-cart");
// Stripe payment
// const { createPaymentIntent } = require("./controllers/stripe");

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
// console.log(new Date());

app.use("/uploads", express.static(`${__dirname}/uploads`));
app.use("/api/payment", stripeRouter);

app.use("/api/shopping-cart", shoppingCartRouter);

app.post("/api/login", logIn);
app.get("/api/logout", authMiddleware, logOut);
app.post("/api/register", register);

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
    clearStaleCarts();
  } catch (error) {
    console.log(error);
  }
};

start();
