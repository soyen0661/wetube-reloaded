import express from "express";
import {
  logout,
  getEdit,
  postEdit,
  getChangePassword,
  postChangePassword,
  deleteUser,
  startGithubLogin,
  finishGithubLogin,
  see,
} from "../controllers/userController";
import {
  publicOnlyMiddleware,
  protectorMiddleware,
  avatarUpload,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/delete", protectorMiddleware, deleteUser);
userRouter.get("/:id", see);

export default userRouter;
