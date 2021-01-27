/**
PROFILES:
- GET https://yourapi.herokuapp.com/api/profile/
Retrieves list of profiles
- GET https://yourapi.herokuapp.com/api/profile/{userId}
Retrieves the profile with userId = {userId}
- POST https://yourapi.herokuapp.com/api/profile/
Create the user profile with all his details
- PUT https://yourapi.herokuapp.com/api/profile/
Update current user profile details
- POST https://yourapi.herokuapp.com/api/profile/{userId}/picture
Replace user profile picture (name = profile)
- GET https://yourapi.herokuapp.com/api/profile/{userId}/CV
Generates and download a PDF with the CV of the user (details, picture, experiences)
*/

const express = require("express");
const jwt = require("jsonwebtoken");
const profileSchema = require("./mongo");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../../utils/cloudinary");
const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "linkedln",
  },
});
const cloudMulter = multer({ storage: cloudStorage });
const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const router = express.Router();
require("dotenv/config");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const profiles = await profileSchema.find();
    res.send(profiles);
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const profiles = await profileSchema.find();
    const resp = res.json(
      profiles.filter((profile) => profile.username === req.user.name)[0]
    );
    res.send(resp);
  } catch (error) {
    next(error);
  }
});
router.post("/", async (req, res, next) => {
  try {
    const postProfile = new profileSchema({
      ...req.body,
      username: req.body.email,
      experiences: [],
    });
    const { _id } = await postProfile.save();
    const username = req.body.email; //req.body.username
    console.log("username", username);
    const user = { name: username };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken: accessToken });
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});
router.post("/cv/:id", async (req, res, next) => {
  try {
    const profile = await profileSchema.findById(req.params.id);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(`
		<h4 style="color:steelblue;">___Powered by Linkedln_____________________________________________</h4>
<article style="text-align:center;">
<img src=${profile.image}  width="200" height="250">
<p>${profile.name} ${profile.surname}<br> ${profile.email} <br> ${profile.area}</p>
</article>
<h4 style="color:steelblue; text-decoration:underline; font-weight:bold; font-family: Arial, Helvetica, sans-serif">ABOUT ME</h4>
<p>${profile.title} <br> ${profile.bio}</p>
<h4 style="color:steelblue; text-decoration:underline; font-weight:bold; font-family: Arial, Helvetica, sans-serif">EXPERIENCE</h4>`);
    await page.emulateMediaFeatures("screen");

    const pdf = await page.pdf({
      //path:`${profile.name}${profile.surname}LinkedlnCV.pdf`,
      format: "A4",
      printBackground: true,
    });
    console.log("done");
    //await browser.close();
    //process.exit();
    res.contentType("application/pdf");
    res.send(pdf);
  } catch (error) {
    console.log(error);
  }
});
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const profile = await profileSchema.findById(req.params.id);
    res.send(profile);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/upload/:id",
  authenticateToken,
  cloudMulter.single("image"),
  async (req, res, next) => {
    try {
      const image = { image: req.file.path };
      const profile = await profileSchema.findById(req.params.id, {
        _id: 0,
        username: 1,
      });
      if (profile.username !== req.user.name) {
        const error = new Error(
          `User does not own the Post with id ${req.params.id}`
        );
        error.httpStatusCode = 403;
        return next(error);
      }
      const newImg = await profileSchema.findByIdAndUpdate(
        req.params.id,
        image,
        {
          runValidators: true,
          new: true,
        }
      );
      if (newImg) {
        res.status(201).send("image uploaded");
      } else {
        const error = new Error(`Profile with id ${req.params.id} not found`);
        error.httpStatusCode = 404;
        next(error);
      }
    } catch (error) {
      console.log("error", error);
      next(error);
    }
  }
);
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const profile = await profileSchema.findById(req.params.id);
    res.send(profile);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const post = { ...req.body };
    const author = await profileSchema.findById(req.params.id, {
      _id: 0,
      username: 1,
    });
    if (author.username !== req.user.name) {
      const error = new Error(
        `Please do not try to change profile with ${req.params.id}`
      );
      error.httpStatusCode = 403;
      return next(error);
    }
    const profile = await profileSchema.findByIdAndUpdate(req.params.id, post, {
      runValidators: true,
      new: true,
    });
    if (profile) {
      res.send(profile);
    } else {
      const err = new Error("Profile not found");
      err.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const author = await profileSchema.findById(req.params.id, {
      _id: 0,
      username: 1,
    });
    if (author.username !== req.user.name) {
      const error = new Error(
        `Please do not try to delete profile with ${req.params.id}`
      );
      error.httpStatusCode = 403;
      return next(error);
    }
    const profile = await profileSchema.findByIdAndDelete(req.params.id);
    if (profile) {
      res.send("deleted");
    } else {
      const error = new Error(`Profile with ${req.params.id} is not found`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});
module.exports = router;
