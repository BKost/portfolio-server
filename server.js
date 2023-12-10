const express = require("express");
const app = express();

// Middleware
const routeNotFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// Router
const categoriesRouter = require("./routes/categories");
const myListingsRouter = require("./routes/my-listings");

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

app.use("/api/categories", categoriesRouter);
app.use("/api/my-listings", myListingsRouter);

app.get("/", (req, res) => {
  res.send("Home");
});

// Route NOt Found
app.use(routeNotFound);

// Custom Error Handler
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5100;

app.listen(port, console.log(`App listening on port ${port}`));
