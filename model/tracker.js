const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    username: String
})

const user = mongoose.model("Users", userSchema);

const excerciseSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    duration: {
        type: Number
    },
    date: Date
})


const excercise = mongoose.model("Exercise", excerciseSchema);

module.exports = { user, excercise };