let mongoose = require('mongoose');

let roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Role name is required"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);