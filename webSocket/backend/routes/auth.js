import express from "express";
import passport from "../middleware/passport.js";

import { getNumberOfUsers, login, register } from "../controllers/auth.js";

const authRouter = express.Router();

authRouter.route("/login").post(login);
authRouter.route("/register").post(register);
authRouter.route("/users_number").get(getNumberOfUsers);

// Google OAuth routes
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true,
  }),
  (req, res) => {
    // Successful authentication, redirect to frontend oauth-redirect.html for token handling
    res.redirect("http://localhost:8080/oauth-redirect.html");
  }
);

authRouter.get("/google/success", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  // Optionally, generate a JWT for the frontend
  const token = req.user.createJWT();
  res.json({ token, user: req.user });
});

export { authRouter };
