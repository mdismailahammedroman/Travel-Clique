import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUploader } from "./cloudinary.config";
import { Request } from "express";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUploader,
  params: (req: Request, file: Express.Multer.File) => {
    const safeName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .split(".")[0];

    const uniqueFileName =
      "travel-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2) +
      "-" +
      safeName;

    return {
      folder: "travel_clique",
      public_id: uniqueFileName,
      resource_type: "image",
    };
  },
});

export const multerUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});
