const mongoose = require("mongoose");
const {Schema, model} = mongoose;

const takSchema = new Schema({
    title: String,
    description: String,
    tasks: { type: Schema.Types.ObjectId, ref: "Project"}
});

module.exports = model("Task", projectSchema);