
// EXPERIENCE:
// - GET https://yourapi.herokuapp.com/api/profile/userName/experiences
// Get user experiences
// - POST https://yourapi.herokuapp.com/api/profile/userName/experiences
// Create an experience.
// - GET https://yourapi.herokuapp.com/api/profile/userName/experiences/:expId
// Get a specific experience
// - PUT https://yourapi.herokuapp.com/api/profile/userName/experiences/:expId
// Get a specific experience
// - DELETE https://yourapi.herokuapp.com/api/profile/userName/experiences/:expId
// Get a specific experience
// - POST https://yourapi.herokuapp.com/api/profile/userName/experiences/:expId/picture
// Change the experience picture
// - POST https://yourapi.herokuapp.com/api/profile/userName/experiences/CSV
// Download the experiences as a CSV

const express = require("express");
const experienceSchema = require("./schema");
const reviewSchema = require("../reviews/schema");
const mongoose = require("mongoose")
const multer = require("multer")

const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../cloudinary")

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      folder: "linkedin"
  }
})
const cloudMulter =  multer({ storage: cloudStorage})

const experiencesRouter = express.Router();

///UPLOADING IMAGE TO CLOUDINARY

experiencesRouter.post("/:id/image/upload", 
cloudMulter.single("image"), async (req, res, next) =>{
  console.log("req file",req.file.path)
  try{
    
     
      const updated = await experienceSchema.findByIdAndUpdate(req.params.id, { image:req.file.path },
        { runValidators: true, new: true }
          )
          res.status(201).send(updated)
        }
  catch(ex){
      console.log(ex)
      next(ex)
  }
})

experiencesRouter.get("/", async (req, res, next) => {
  try {
    const experiences = await experienceSchema.find();
    res.send(experiences);
  } catch (error) {
    console.log(error);
  }
});


experiencesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
  
    const experience = await experienceSchema.findById(id)
    if (experience) {
      res.send(experience)
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next("While reading experiences list a problem occurred!")
  }
})




experiencesRouter.get("/category/:categoryName", async (req, res, next) => {
  try {
   // const categoryName= /^req.params.categoryName$/i

  
            const filteredexperiences = await  experienceSchema.find(
            {
                category: {$regex: new RegExp('^' + req.params.categoryName, 'i')}
            }
          )
          res.send(filteredexperiences)
        
 
  } catch (error) {
    console.log(error)
    next("While reading experiences list a problem occurred!")
  }
})

experiencesRouter.post("/", async (req, res, next) => {
  try {
    const newexperience = new experienceSchema(req.body)
    const { _id } = await newexperience.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

experiencesRouter.put("/:id", async (req, res, next) => {
  try {
    const experience = await experienceSchema.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    })
    if (experience) {
      res.send(experience)
    } else {
      const error = new Error(`experience with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

experiencesRouter.delete("/:id", async (req, res, next) => {
  try {
    const experience = await experienceSchema.findByIdAndDelete(req.params.id)
    if (experience) {
      res.send("Deleted")
    } else {
      const error = new Error(`experience with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})





module.exports = experiencesRouter;
