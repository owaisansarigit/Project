const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const allRoute = require("./Route/allRoutes.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/Users");
const { URL } = require("url");
const punycode = require("punycode");
const MongoDBStore = require("connect-mongodb-session")(session);

require("dotenv").config();

const MONGO_URL = process.env.DB_URL;
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("error");
  });
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/Public"));
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.listen(3000, () => {
  console.log("Server Started !");
});

const store = new MongoDBStore({
  uri: MONGO_URL,
  collection: "sessions",
});
app.use(
  session({
    secret: "mySecret",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  next();
});

app.use("/", allRoute);
