import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Name should be more than 3 characters"],
        maxlenght: [20, "Name must not exceed 20 characters"],
    },
    email: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email"],
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        minlength: [6, "Password should be more than 6 characters"],
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{6,}$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        ],
        unique: true,
    },
});

export const User = mongoose.model("User", userSchema);
