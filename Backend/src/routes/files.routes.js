import {Router} from 'express';
import upload from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/upload").post(
    upload.array("files"),
    uploadFiles
);
router.route("/session").get(
    getSessions
);
router.route("/:id").delete(
    deleteSessionById
);


export default router;