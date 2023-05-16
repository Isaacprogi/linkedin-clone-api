const mongoose = require('mongoose')


const ConnectModel = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    pending: { type: Boolean, unique: false, default: true }
}, {
    timestamps: true,
}
)

const Connections = mongoose.model("Connections", ConnectModel);

module.exports = Connections
