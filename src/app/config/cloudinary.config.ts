/* eslint-disable @typescript-eslint/no-explicit-any */

import { v2 as cloudinary, } from "cloudinary";
import { envVars } from "./envVars";


cloudinary.config({
    cloud_name:envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key:envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret:envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
})

// export const uploadBufferToCloudinary = async (buffer: Buffer, fileName: string): Promise<UploadApiResponse | undefined> => {
//     try {
//         return new Promise((resolve, reject) => {

//             const public_id = `pdf/${fileName}-${Date.now()}`

//             const bufferStream = new Stream.PassThrough();
//             bufferStream.end(buffer)

//             cloudinary.uploader.upload_stream(
//                 {
//                     resource_type: "auto",
//                     public_id: public_id,
//                     folder: "pdf"
//                 },
//                 (error, result) => {
//                     if (error) {
//                         return reject(error);
//                     }
//                     resolve(result)
//                 }
//             ).end(buffer)


//         })

//     } catch (error: any) {
//         console.log(error);
//         throw new AppError(statusCode.UNAUTHORIZED, `Error uploading file ${error.message}`)
//     }
// }

// export const deleteImageFromCLoudinary = async (url: string) => {
//     try {
//         //https://res.cloudinary.com/djzppynpk/image/upload/v1753126572/ay9roxiv8ue-1753126570086-download-2-jpg.jpg.jpg

//         const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;

//         const match = url.match(regex);

//         console.log({ match });

//         if (match && match[1]) {
//             const public_id = match[1];
//             await cloudinary.uploader.destroy(public_id)
//             console.log(`File ${public_id} is deleted from cloudinary`);

//         }
//     } catch (error: any) {
//         throw new AppError(statusCode.UNAUTHORIZED, "Cloudinary image deletion failed", error.message)
//     }
// }

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

// MULTIPLE FILES UPLOAD
export const uploadMultipleToCloudinary = async (
  files: Express.Multer.File[],
  folder: string
) => {
  const uploadResults = [];

  for (const file of files) {
    const result: any = await uploadToCloudinary(file.buffer, folder);
    uploadResults.push(result);
  }

  return uploadResults;
};

// Extract Cloudinary public_id from URL
export const extractPublicId = (url: string): string => {
  return url.split("/upload/")[1].split(".")[0];
};

// Delete image from Cloudinary
export const deleteCloudinaryImage = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};
export const cloudinaryUploader=cloudinary 

