import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.configDotenv();

export const isLogin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/login?error=Please login to continue");
    }
    if (token) {
      try {
        const verify = jwt.verify(token, process.env.JWT_SECRET);
        console.log("verify", verify);
        if (verify) {
          req.user = verify;
          console.log("user is ", verify);

          next();
        } else {
          res.status(401).render("forgotPass");
        }
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          return res.redirect(
            "/login?error=Session expired. Please login again"
          ); // Token expired
        } else {
          return res.redirect(
            "/login?error=Authentication failed. Please login again"
          );
        }
      }
    } else {
      res.status(401).render("forgotPass");
    }
  } catch (error) {
    console.error(error);
  }
};

export const isLogout = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (token) {
      try {
        // Verify token is valid
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('decoded ',decoded);
        
        return res.redirect("/home"); // or wherever you want to redirect logged-in users
      } catch (err) {
        // If token is invalid, clear it and continue to login page
        res.clearCookie("token");
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
