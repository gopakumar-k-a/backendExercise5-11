import { Router } from "express";
import userController from "../controllers/userController.js";
import { isLogin, isLogout } from "../middleware/auth.js";
const router = Router();

router.get("/", userController.loadHome);
router.post("/register", userController.registerUser);
router.get("/register", isLogout, userController.loadRegister);
router.get("/login", isLogout, userController.loadLogin);
router.post("/login", userController.userLogin);
router.get("/logout", userController.logout);
router.get("/home", isLogin, userController.loadHome);
router.put("/update-user/:id", isLogin, userController.updateUser);
router.delete("/delete-user/:id", isLogin, userController.deleteUser);

export default router;
