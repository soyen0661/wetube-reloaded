import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcryptjs";

export const getJoin = (req, res) =>
  res.render("join", { pageTitle: "Create Account" });

export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;
  const pageTitle = "Create Account";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, SocialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  } else {
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).render("login", {
        pageTitle,
        errorMessage: "Wrong password",
      });
    } else {
      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/");
    }
  }
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        email: emailObj.email,
        username: userData.login,
        password: "",
        SocialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  //req.session.loggedIn = false;
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) =>
  res.render("users/edit-user", {
    pageTitle: "Edit Profile",
  });

export const postEdit = async (req, res) => {
  const {
    user: { _id, avatarUrl },
  } = req.session;
  const {
    body: { name, username, email, location },
    file,
  } = req;
  if (username !== req.session.user.username) {
    const exists = await User.exists({ username });
    if (exists) {
      return res.status(400).render("users/edit-user", {
        pageTitle: "Edit Profile",
        errorMessage: "This username is already taken.",
      });
    }
  }
  if (email !== req.session.user.email) {
    const exists = await User.exists({ email });
    if (exists) {
      return res.status(400).render("users/edit-user", {
        pageTitle: "Edit Profile",
        errorMessage: "This email is already taken.",
      });
    }
  }

  const isHeroku = process.env.NODE_ENV === "production";
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
      name,
      username,
      email,
      location,
    },
    { new: true }
  );
  req.session.user = updateUser;
  return res.redirect(`/users/${_id}`);
};

export const getChangePassword = (req, res) => {
  if (req.session.user.SocialOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const {
    user: { _id, password },
  } = req.session;
  const match = await bcrypt.compare(oldPassword, password);
  if (!match) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The new password confirmation does not match.",
    });
  }
  const user = await User.findById(_id);
  user.password = newPassword;
  await user.save();
  req.session.user.password = user.password;
  req.flash("info", "Password Updated");
  req.session.destroy();
  return res.redirect("/login");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: { path: "owner" },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  return res.render("users/see", {
    pageTitle: user.name,
    user,
  });
};
