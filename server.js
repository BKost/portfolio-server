require("dotenv").config();

const express = require("express");
const app = express();

// donnectDB
const { connectToDatabase } = require("./db/connectDB");

// Middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// Routers
const categoriesRouter = require("./routes/categories");
const myListingsRouter = require("./routes/my-listings");
const myProfileRouter = require("./routes/my-profile");

const { logIn } = require("./controllers/login");
const { register } = require("./controllers/register");
const { logOut } = require("./controllers/logout");

// Categories:
// - getAllItems
// - getSingleItem

// My listings:
// - getAllItems
// - deleteItem
// - updateItem
// - uploadItem

// My profile:
// getProfileInfo
// updateProfileInfo

// Register:
// - registerUser

// Login:
// - logIn

// Log out:
// - logOut

app.use(express.json());

app.post("/api/login", logIn);
app.post("/api/register", register);
app.post("/api/log-out", logOut);

app.use("/api/categories", categoriesRouter);
app.use("/api/my-listings", myListingsRouter);
app.use("/api/my-profile", myProfileRouter);

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
