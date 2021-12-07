import Formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import config from "@/config";
import errors from "@/errors";

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export default function upload(req) {
  return new Promise((resolve, reject) => {
    // parse a file upload
    const form = new Formidable();

    form.parse(req, (err, fields, files) => {
      if (err) {
        throw errors.unable_to_upload_image();
      }

      cloudinary.uploader.upload(
        files.file.path,
        {
          eager: [
            {
              width: 150,
              height: 150,
              gravity: "face",
              crop: "fill",
              quality: "70",
              format: "webp",
            },
          ],
        },
        (error, result) => {
          if (error) {
            throw errors.unable_to_upload_image();
          }
          resolve(result.eager[0].secure_url);
        }
      );
    });
  });
}
