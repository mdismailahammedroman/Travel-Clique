import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUploader } from "./cloudinary.config";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUploader,
  params: (req, file) => {
    const fileName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\./g, "-")
         .replace(/[^a-z0-9\-.]/g, "") 

    const extension = file.originalname.split(".").pop();

    const uniqueFileName =
      Math.random().toString(36).substring(2) +
      "-" +
      Date.now() +
      "-" +
      fileName +
      "." +
      extension;

    return {
      folder: "travel_clique", // <-- folder must be inside the returned object
      public_id: uniqueFileName,
      resource_type: "image", // important for images
    };
  },
});

export const multerUpload = multer({ storage });
