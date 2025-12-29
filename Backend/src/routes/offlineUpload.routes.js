import {Router} from "express";
import upload from "../middlewares/multer.middleware.js";
import { uploadFile,fileStatus } from "../controllers/offlineUpload.controller.js";

const offlineUploadRouter = Router();


offlineUploadRouter.route("/offline-upload").post(upload.array("files"), uploadFile);
offlineUploadRouter.route("/status").get(fileStatus);

export default offlineUploadRouter;
