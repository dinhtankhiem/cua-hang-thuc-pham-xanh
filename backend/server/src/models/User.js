import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Counter from "./Counter.js";

const roleEnum = ["manager", "staff", "customer"];
const statusEnum = ["active", "inactive"];
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: roleEnum,
        default: "manager",
    },
    status: {
        type: String,
        enum: statusEnum,
        default: "active",
    },
    avatar: {
        type: String,
        default: "https://via.placeholder.com/150",
    },
    address: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: ""
    }
}, { timestamps: true });

userSchema.pre("validate", async function (next) {
    try {
        if (this.isNew && !this.userId) {
            this.userId = await generateUserId(this.role);
        }
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10);
        }

        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

async function generateUserId(role) {
    const counter = await Counter.findOneAndUpdate(
        { _id: role },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );

    return `${role}-${counter.seq.toString().padStart(6, "0")}`;
}

export default User;