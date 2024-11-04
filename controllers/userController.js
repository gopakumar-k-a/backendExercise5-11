import { userModel } from "../models/userModel.js";
import hashPassword from "../utility/bcrypt.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
dotenv.configDotenv();

const userController = {
  loadHome: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1; // Get the page number from the query string
      const limit = 10; // Set the limit of users per page
      const skip = (page - 1) * limit; // Calculate how many users to skip

      const usersData = await userModel
        .find({}, { password: 0 })
        .skip(skip)
        .limit(limit);
      const totalUsers = await userModel.countDocuments(); // Get the total number of users
      const totalPages = Math.ceil(totalUsers / limit); // Calculate the total number of pages

      res.render("home", {
        usersData,
        currentPage: page,
        totalPages,
        totalUsers,
      });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  loadLogin: async (req, res, next) => {
    try {
      res.render("login", {
        error: req?.query?.error,
        success: req?.query?.success,
      });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
  loadRegister: async (req, res, next) => {
    try {
      const message = req.query.message || "";
      res.render("register", { message, user: "" });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  registerUser: async (req, res, next) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword,
        profession,
      } = req.body;

      if (
        !(
          firstName ||
          lastName ||
          email ||
          phone ||
          password ||
          confirmPassword ||
          profession
        )
      ) {
        const message = "all fields must be filled";
        const user = {
          firstName,
          lastName,
          email,
          phone,
          password,
          confirmPassword,
          profession,
        };
        return res.render(`register`, { message, user });
      }

      if (password != confirmPassword) {
        const message = "confirm password and password should be same";
        const user = {
          firstName,
          lastName,
          email,
          phone,
          password,
          confirmPassword,
          profession,
        };
        return res.render(`register`, { message, user });
      }

      const existUser = await userModel.findOne({ email });
      if (existUser) {
        const message = "user already exists";
        const user = {
          firstName,
          lastName,
          email,
          phone,
          password,
          confirmPassword,
          profession,
        };
        return res.render(`register`, { message, user });
      }
      const hashedPass = await hashPassword(password);
      const newUser = new userModel({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPass,
        profession,
      });

      await newUser.save();

      console.log("req body registration ", req.body);
      console.log(Object.keys(req.body));

      return res.redirect(
        "/login?success=registration successfull , login to continue"
      );
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
  userLogin: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Missing email or password" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const userData = await userModel.findOne({ email }).select("+password"); // Include password for comparison

      if (!userData) {
        return res.status(401).json({ message: "Incorrect email or password" });
      }

      const isMatch = await bcrypt.compare(password, userData.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect email or password" });
      }
      console.log("req.body ", req.body);
      const token = jwt.sign(
        { id: userData._id, email: userData.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      console.log("token ", token);

      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Adjust based on your environment
        sameSite: "Strict",
        maxAge: 3600000, // 1 hour in milliseconds
      });
      return res.status(200).json({ redirect: "/home" });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
  logout: async (req, res) => {
    try {
      console.log("userlogout");
      res.clearCookie("token");
      res.redirect("/login");
    } catch (error) {
      console.error(error.message);
      next(error);
    }
  },
  updateUser: async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, phone } = req.body;
    try {
      const updatedUser = await userModel.findByIdAndUpdate(userId, {
        firstName,
        lastName,
        phone,
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      updatedUser.password = undefined;
      console.log("updated user ", updatedUser);

      res.json(updatedUser);
    } catch (error) {
      console.error(error.message);
      next(error);
    }
  },
  deleteUser: async (req, res, next) => {
    const userId = req.params.id;
    try {
      await userModel.findByIdAndDelete(req.params.id);
      res.json({ deletedId: userId });
    } catch (error) {
      console.error(error.message);
      next(error);
    }
  },
};

export default userController;
