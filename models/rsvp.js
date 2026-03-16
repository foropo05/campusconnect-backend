const mongoose = require('mongoose');

let rsvpSchema = mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    },
    status: {
        type: String,
        default: "going"
    },
    created: {
        type: Date,
        default: Date.now
    }
},
{
    collection: "rsvps"
});

module.exports = mongoose.model("RSVP", rsvpSchema);