import Video from "../models/Video";
import User from "../models/User";
const VIDEONOTFOUND = "Video not found";
const formattedCreatedAt = (date) => {
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return formattedDate;
};

export const home = async (req, res) => {
  try {
    const videos = await Video.find({}).populate("owner");
    return res.render("home", {
      pageTitle: "Home",
      videos,
    });
  } catch {
    return res.render("server-error");
  }
};
export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const watch = async (req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id).populate("owner");
  const createdAt = formattedCreatedAt(new Date(video.createdAt));

  if (!video) {
    return res.status(404).render("404", { pageTitle: VIDEONOTFOUND });
  }
  return res.render("videos/watch", {
    pageTitle: `Watching ${video.title}`,
    video,
    createdAt,
  });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: VIDEONOTFOUND });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  return res.render("videos/edit", {
    pageTitle: `Editing ${video.title}`,
    video,
  });
};
export const postEdit = async (req, res) => {
  const id = req.params.id;
  const video = await Video.exists({ _id: id });
  const { title, description, hashtags } = req.body;
  if (!video) {
    return res.status(404).render("404", { pageTitle: VIDEONOTFOUND });
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};
export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};
export const comments = (req, res) =>
  res.render("videos/comments", { pageTitle: "Comments" });
export const deleteComment = (req, res) =>
  res.render("videos/delete-comments", {
    pageTitle: "Delete | Comments",
  });
export const getUpload = (req, res) =>
  res.render("videos/upload", { pageTitle: "Upload Video" });

export const postUpload = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    files: { video, thumb },
    body: { title, description, hashtags },
  } = req;
  try {
    const newVideo = await Video.create({
      title,
      description,
      videoUrl: video[0].path,
      thumbUrl: thumb[0].path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("videos/upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const registerView = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  } else {
    video.meta.views += 1;
    await video.save();
    return res.sendStatus(200);
  }
};
