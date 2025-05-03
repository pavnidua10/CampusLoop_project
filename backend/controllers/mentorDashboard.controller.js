import Resource from "../models/resource.model.js";


export const uploadResource = async (req, res) => {
  try {
    const fileUrl = req.file.path;
    const fileName = req.file.originalname;

    const resource = await Resource.create({
      mentor: req.user._id,
      fileUrl,
      fileName,
    });

    res.status(200).json(resource);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const getMentorResources = async (req, res) => {
  try {
    const resources = await Resource.find({ mentor: req.user._id });
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch resources" });
  }
};

export const getResourcesForMentee = async (req, res) => {
  try {
    const resources = await Resource.find().populate("mentor", "fullName");
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch resources" });
  }
};
