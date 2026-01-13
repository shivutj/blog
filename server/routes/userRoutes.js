import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  getPublishedCreations,
  getUserCreations,
  toggleLikeCreation,
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/userController.js";

const userRouter = express.Router();

// Auth routes (public)
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", auth, getUserProfile);

// Protected routes
userRouter.get("/get-user-creations", auth, getUserCreations);
userRouter.get("/get-published-creations", auth, getPublishedCreations);
userRouter.post("/toggle-like-creation", auth, toggleLikeCreation);

export default userRouter;
