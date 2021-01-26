const express = require("express")
const cors = require("cors")
const { join } = require("path")
const listEndpoints = require("express-list-endpoints")
const mongoose = require("mongoose")
const profileRouter = require("./services/profiles/index")
const postsRouter = require("./services/posts")
//const experienceRouter = require("./services/experience");

require("dotenv/config")
const {
	notFoundHandler,
	badRequestHandler,
	genericErrorHandler,
} = require("./errorHandlers")

server = express()

const port = process.env.PORT

const staticFolderPath = join(__dirname, "../public")
server.use(express.static(staticFolderPath))
server.use(express.json())

server.use(cors())

server.use("/profile", profileRouter)
server.use("/post", postsRouter)
//server.use("/experience", experienceRouter);

server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

console.log(listEndpoints(server))

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
	.catch((err) => console.log(err))
