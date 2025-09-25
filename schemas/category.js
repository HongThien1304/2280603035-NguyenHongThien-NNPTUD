let mongoose = require('mongoose');

let schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = new mongoose.model('category', schema);