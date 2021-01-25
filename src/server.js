const express = require("express");
const cors  = require("cors");
const { join } =  require("path");
const multer = require('multer');
const jwt = require("jsonwebtoken");
const listEndpoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const profileRouter = require("./services/profiles/index");
//const postsRouter = require("./services/posts");
//const experienceRouter = require("./services/experience");

require("dotenv/config");
const {
    notFoundHandler,
    badRequestHandler,
    genericErrorHandler,
  } = require("./errorHandlers");

server = express();

const port = process.env.PORT;

const staticFolderPath = join(__dirname, "../public");
server.use(express.static(staticFolderPath));
server.use(express.json());

server.use(cors());

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err,user) => {
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })
}
/*server.use(multer({dest: profileRouter, 
rename:function(filedname,filename){
    return filename
}}))*/
server.use("/profile", profileRouter);
//server.use("/post", authetnicateToken, postsRouter);
//server.use("/experience", authetnicateToken, experienceRouter);

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

console.log(listEndpoints(server));

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(port, () => {
      console.log("Running on port", port)
    })
  )
  .catch(err => console.log(err));