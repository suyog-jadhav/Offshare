import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getCustomerById,
  getCustomerByPhone,
  createCustomer
} from "../db/crud/customer.crud.js";
import { v4 as uuidv4 } from "uuid";
import db from "../db/connection.js";

/**
 * Create a registered customer (NOT guest)
 */
export const createNewCustomer = asyncHandler(async (req, res) => {
  console.log("Received request to create new customer");
  console.log("Creating new customer with data:", req.body);
  const { name, phone } = req.body || {};
  if (!name || !phone) {
    throw new ApiError(400, "name and phone are required");
  }

  // Prevent duplicate customers by phone and customer_id (if provided)
  const existingByPhone = await getCustomerByPhone(phone);
  if (existingByPhone) {
    throw new ApiError(409, "Customer with this phone already exists");
  }


  const customer = {
    id: uuidv4(),
    name,
    phone,
    is_guest: 0
  };
  console.log("Creating customer:", customer);

  try {
    await createCustomer(customer);
  } catch (err) {
    console.error("Failed to create customer:", err);
    if (err && err.code && err.code.includes("SQLITE_CONSTRAINT")) {
      throw new ApiError(409, "Customer already exists");
    }
    throw new ApiError(500, "Failed to create customer");
  }

  return res.status(201).json(
    new ApiResponse("Customer created successfully", customer, 201)
  );
});

/**
 * Get customer by ID
 */
export const getCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Customer ID is required");
  }

  const customer = await getCustomerById(id);
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return res.status(200).json(
    new ApiResponse("Customer fetched successfully", customer, 200)
  );
});

export const getAllCustomersController = asyncHandler(async (req, res) => {
  // Optional search
  const { search } = req.query;

  // REFACTOR: Use 'devices' table as the source of "Customers"
  console.log("Fetching customers from DEVICES table");

  // Query: Select all devices, and join with print_jobs via sessions to calculate total spend/jobs
  // Devices -> Sessions -> Print Jobs

  let query = `
    SELECT 
        d.id,
        d.device_name as name,
        d.local_ip as phone, -- Using IP as phone/identifier for now
        d.last_seen as created_at,
        COUNT(DISTINCT pj.id) as total_jobs,
        COALESCE(SUM(pj.cost), 0) as total_spent
    FROM devices d
    LEFT JOIN sessions s ON s.device_id = d.id
    LEFT JOIN files f ON f.session_id = s.id
    LEFT JOIN print_jobs pj ON pj.file_id = f.id AND pj.status = 'PRINTED'
  `;

  const params = [];

  if (search) {
    query += ` WHERE d.device_name LIKE ?`;
    params.push(`%${search}%`);
  }

  query += ` GROUP BY d.id ORDER BY d.last_seen DESC`;

  try {
    const customers = db.prepare(query).all(...params);
    console.log(`[DEBUG] Fetched ${customers.length} devices (as customers)`);

    return res.status(200).json(
      new ApiResponse("All customers fetched", customers, 200)
    );
  } catch (e) {
    console.error("Fetch Customers/Devices Error:", e);
    throw new ApiError(500, "Failed to fetch customers");
  }
});
