import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import nocache from "nocache";
dotenv.configDotenv();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(nocache());
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use("/", userRoute);
const connectDB = async () => {
  try {
    // console.log(process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("mongodb connected");
  } catch (error) {
    console.error("Mongo Db connection failed: ", error.message);
    process.exit(1);
  }
};

app.use("*", (req, res) => {
  res.render("404");
});

app.use((err, req, res, next) => {
  console.error(err); // Log the error
  res.status(err.status || 500);
  res.json({ message: err.message || "Internal Server Error" }); // Send a generic error response
});
const PORT = process.env.PORT || 3000;
connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
