const mongoose = require('mongoose');

let userSchema = mongoose.Schema(
{
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
   role: {
  type: String,
  enum: ["student", "admin"],
  default: "student"

    },
    created: {
        type: Date,
        default: Date.now
    }
},
{
    collection: "users"
});

module.exports = mongoose.model("User", userSchema);