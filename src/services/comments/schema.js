const { Schema, model } = require("mongoose")
mongoosePaginate = require("mongoose-paginate-v2")
/**
 * {
"_id": "5d84937322b7b54d848eb41b", //server generated
"name": "Diego",
"surname": "Banovaz",
"email": "diego@strive.school",
"bio": "SW ENG",
"title": "COO @ Strive School",
"area": "Berlin",
"image": ..., //server generated on upload, set a default here
"username": "admin",
"createdAt": "2019-09-20T08:53:07.094Z", //server generated
"updatedAt": "2019-09-20T09:00:46.977Z", //server generated
}
 */
const commentSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		comment: {
			type: String,
			required: true,
			unique: true,
		},
	},
	{ timestamps: true }
)
commentSchema.plugin(mongoosePaginate)
module.exports = model("Comments", commentSchema)
