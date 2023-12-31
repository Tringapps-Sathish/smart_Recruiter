const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../../Models/User_Model.js");

dotenv.config(); 

const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }
    try {
        const findUser = await userModel.findOne({ email: email });
        if (!findUser) {
            return res.status(404).json({
                error: "No such user found",
            });
        }
        const checkStatus = findUser.isVerified;
        if (checkStatus == false) {
            return res.status(403).json({
                error: "Email isn't verified, kindly first verify your email address",
            });
        }

        const unhashed = await bcrypt.compare(password, findUser.password);
        if (!unhashed) {
            return res.status(401).json({
                error: "Incorrect password",
            });
        }

        const payload = {
            id: findUser._id,
            user: findUser.f_name
        };

        const token = jwt.sign(payload, process.env.KEY, { expiresIn: "96h" });
        return res.status(200).json({
            message: "Login successful",
            token: token,
        });
    }
    catch (e) {
        res.send("Something un-expected happend! " + e)
    }
};
module.exports = login;
