import express from "express";
import { getNumberOfUsers, login, register } from "../controllers/auth.js";

const authRouter = express.Router();

authRouter.route("/login").post(login);
authRouter.route("/register").post(register);
authRouter.route("/users_number").get(getNumberOfUsers);

export { authRouter };
