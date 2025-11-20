import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const roleEnum = ["manager", "staff","customer"];
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
        default: "customer",
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

const User = mongoose.model("User", userSchema);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

async function generateUserId(role) {
    const lastUser = await User.findOne({ role }).sort({ createdAt: -1 });
    if (!lastUser) {
        return role + "-000001";
    }
    const lastUserId = lastUser.userId.split("-")[1];
    const newUserId = parseInt(lastUserId) + 1;
    return role + "-" + newUserId.toString();
}

export default User;