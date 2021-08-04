const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')



const userScehma = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    age: {
        type: Number,
        default: 20,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid");
            }
        },
    },

    password: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minLength: 6,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("Password can't contain password word");
            }
        },
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});



userScehma.virtual('userTasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})



userScehma.pre("save", async function(next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});



userScehma.statics.findByCredentials = async(email, password) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Unable to login");
    }

    return user;
};




userScehma.methods.generateToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'node-course')

    user.tokens = user.tokens.concat({ token: token })
    await user.save()

    return token
}

const User = mongoose.model("User", userScehma);
module.exports = User;