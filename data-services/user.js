import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    manager: {type: String},
    isManager: { type: Boolean, default: false},
});

const User = mongoose.model('User', userSchema);

module.exports = User;