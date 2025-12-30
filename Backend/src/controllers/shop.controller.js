import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {v4 as uuidv4} from "uuid";
import { createShopInDB, getShopFromDB, updateShopInDB } from "../db/crud/shop.crud.js";
import { getLocalIP } from "../utils/IPprovider.js";

export const createShop = asyncHandler(async (req,res)=>{
    
    const shopExists = await getShopFromDB();

    if(shopExists){
        throw new ApiError(409,"Shop already exists");
    }

    console.log("Request Body:", req.body);

    const {name,phone,address,owner_name} = req.body;

    if(!name || !phone || !address || !owner_name){
        throw new ApiError(400,"All fields are required");
    }
    
    const shop = {
        id: uuidv4(),
        name,
        owner_name,
        phone,
        address,
        local_ip: await getLocalIP()
    }
    console.log("Creating Shop with data:", shop);
    await createShopInDB(shop);

    // const verifyShop = await getShopFromDB();
    
    // if(!verifyShop){
    //     throw new ApiError(500,"Shop creation failed");
    // }

    return res.status(201).json(
        new ApiResponse("Shop created successfully", shop, 201)
    )
})

export const getShop = asyncHandler(async (req,res)=>{
    const shop = await getShopFromDB();

    if(!shop){
        throw new ApiError(404,"Shop not found");
    }

    return res.status(200).json(
        new ApiResponse("Shop fetched successfully", shop, 200)
    )
})

export const updateShop = asyncHandler(async (req,res)=>{
    const existingShop = getShopFromDB();
    if (!existingShop) {
        throw new ApiError(404, "Shop not found");
    }

    const updatedShop = {
        id: existingShop.id,
        name: req.body.name ?? existingShop.name,
        owner_name: req.body.owner_name ?? existingShop.owner_name,
        phone: req.body.phone ?? existingShop.phone,
        address: req.body.address ?? existingShop.address,
        local_ip: existingShop.local_ip
    };

    updateShopInDB(updatedShop);

    return res.status(200).json(
        new ApiResponse("Shop updated successfully", updatedShop)
    );
})

