import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {v4 as uuidv4} from "uuid";
import { createSessionInDB, endSessionInDB, updateHeartbeatInDB,getActiveSessionFromDB} from "../db/crud/session.crud.js";
import { upsertDevice } from "../db/crud/device.crud.js";
import { getLocalIP } from "../utils/IPprovider.js";
import {SESSION_TTL,HEARTBEAT_EXTEND} from "../../constants.js";

export const startSession = asyncHandler(async(req,res)=>{
    const {device_type,device_name,device_id} = req.body;

    if(!device_type || !device_name ){
        throw new ApiError(400,"Device information is required");
    }
    const sessionId = uuidv4();
    const deviceId = device_id || uuidv4();

    await upsertDevice({
        id: deviceId,
        device_name,
        device_type,
        local_ip: await getLocalIP()
    })

   
    await createSessionInDB({
        id: sessionId,
        device_id:deviceId
    })

   
    return res.status(201).json(
        new ApiResponse("Session created successfully", {
            session_id: sessionId,
            device_id: deviceId,
            expires_in:SESSION_TTL //seconds
        }, 201)
    )    
})

export const endSession = asyncHandler(async(req,res)=>{
    const {session_id} = req.body;

    if(!session_id){
        throw new ApiError(400,"Session ID is required");
    }

    const activeSession = await getActiveSessionFromDB(session_id);

    if(!activeSession){
        throw new ApiError(404,"Active session not found");
    }

    await endSessionInDB(session_id);

    return res.status(200).json(
        new ApiResponse("Session ended successfully", null, 200)
    )

})

export const heartbeat = asyncHandler(async(req,res)=>{
    const {session_id} = req.body;

    if(!session_id){
        throw new ApiError(400,"Session ID is required");
    }

    const activeSession = await getActiveSessionFromDB(session_id);
    if(!activeSession){
        throw new ApiError(404,"Active session not found");
    }

    await updateHeartbeatInDB(session_id);

    return res.status(200).json(
        new ApiResponse("Heartbeat updated successfully", {
            expires_in:HEARTBEAT_EXTEND,//seconds
            server_time: Date.now()
        }, 200)
    )
})