const express = require("express");
const router = express.Router();
const User = require("../Models/Users");
const passport = require("passport");
const Post = require("../Models/Post");

router.get("/", async (req, res) => {
  let data = await Post.find();
  res.render("home.ejs", { data });
});
// Login GET
router.get("/login", (req, res) => {
  res.render("login.ejs");
});
// Login Post
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Invalid username or password.",
  }),
  (req, res) => {
    req.flash("success", "Welcome Back !");
    res.redirect("/");
  }
);
// SignUp GET
router.get("/register", (req, res) => {
  res.render("register.ejs");
});
// SignUp Post
router.post("/register", async (req, res) => {
  try {
    let { name, username, email, password } = req.body;
    let newUser = await new User({
      name: name,
      email: email,
      username: username,
    });
    let registeredUser = await User.register(newUser, password);
    req.flash("success", "User Registered Successfully");
    res.redirect("/list");
  } catch (e) {
    req.flash("error", `${e.message} Please Login`);
    res.redirect("/user/login");
  }
});
// Logout
router.get("/logout", (req, res) => {
  req.logOut(() => {
    req.flash("success", "Logged out Successfully !");
    res.redirect("/");
  });
});

// Blog related routes
router.get("/post/:id", async (req, res) => {
  res.render("showpost.ejs");
});

router.get('/newpost',(req,res)=>{
  res.render('newpost.ejs')
})
// Now 
const handleError = (res, error, message = "Default Error Message !") => {
  console.error(error);
  let data = message;
  res.render("error.ejs", { data });
};
module.exports = router;
