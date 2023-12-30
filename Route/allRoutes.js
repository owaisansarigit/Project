const express = require("express");
const router = express.Router();
const User = require("../Models/Users");
const passport = require("passport");
const Post = require("../Models/Post");
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

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
    await registeredUser.save();
    req.flash("success", "User Registered Successfully");
    res.redirect("/");
  } catch (e) {
    req.flash("error", `${e.message} Please Login`);
    res.redirect("/register");
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

router.get("/newpost", isLoggedIn, (req, res) => {
  res.render("newpost.ejs");
});
router.post("/newpost", async (req, res) => {
  try {
    let newPost = await Post.create(req.body);
    let user = await User.findById(req.user.id);
    user.posts.push(newPost._id);
    newPost.user = req.user.id;
    await user.save();
    await newPost.save();
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/my-profile", isLoggedIn, async (req, res) => {
  let data = await User.findById(req.user.id).populate("posts");
  res.render("myprofile.ejs", { data });
});

router.get("/post/edit/:id", isLoggedIn, async (req, res) => {
  let data = await Post.findById(req.params.id);
  res.render("editpost.ejs", { data });
});
router.put("/post/edit/:id", async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, req.body);
    req.flash("success", "Post Edit Succes");
    res.redirect("/my-profile");
  } catch (e) {
    console.log(e);
    req.flash("error", "Post Edit Fail");
    res.redirect("/my-profile");
  }
});

router.delete("/post/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    let user = await User.findById(req.user.id);
    if (post.user == user.id) {
      await Post.findByIdAndDelete(post.id);
      user.posts.pull(post.id);
      await user.save();
      req.flash("success", "Post Deleted !");
      res.redirect("/my-profile");
    } else {
      req.flash("error", "This is not your Post !");
      res.redirect("/my-profile");
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
