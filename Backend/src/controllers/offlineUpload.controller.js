import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";



export const uploadFile = asyncHandler(async (req, res) => {
    const { username } = req.body;

    console.log("Body:", req.body);
    console.log("Files:", req.files);

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "No files uploaded");
    }

    const result = await createFiles({
        username,
        files: req.files
    });

    console.log("Database Insertion Result:", result);

    if(result.inserted !== req.files.length) {
        throw new ApiError(500, "Some files were not saved correctly");
    }


    return res.status(201).json(
        new ApiResponse("Files uploaded successfully", null, 201)
    );
});

export const fileStatus = asyncHandler(async (req,res)=>{})



//     import express from "express";
// import upload from "../config/multer.config.js";
// import {
//   createFiles,
//   getAllFiles,
//   getFilesByUsername
// } from "../database/crud.js";

// const router = express.Router();

// router.post("/", upload.array("files", 10), async (req, res) => {
//   try {
//     const { username } = req.body;

//     await createFiles({
//       username,
//       files: req.files
//     });

//     res.status(201).json({ message: "Uploaded successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.get("/", async (req, res) => {
//   const files = await getAllFiles();
//   res.json(files);
// });

// router.get("/:username", async (req, res) => {
//   const files = await getFilesByUsername(req.params.username);
//   res.json(files);
// });

// export default router;
