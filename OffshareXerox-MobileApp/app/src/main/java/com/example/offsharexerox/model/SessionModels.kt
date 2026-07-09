package com.example.offsharexerox.model

/* -------- SESSION -------- */

data class StartSessionResponse(
    val success: Boolean,
    val message: String,
    val data: SessionData
)

data class SessionData(
    val session_id: String,
    val device_id: String,
    val expires_in: Int
)

/* -------- FILES -------- */

data class FilesResponse(
    val success: Boolean,
    val message: String,
    val data: List<FileItem>
)

data class SimpleResponse(
    val success: Boolean,
    val message: String,
    val data: Any?
)

data class PrintSettingsRequest(
    val session_id: String,
    val settings: PrintSettingsData
)

data class PrintSettingsData(
    val color_mode: String,
    val copies: Int,
    val paper_size: String,
    val sides: String,
    val orientation: String
)

data class PrintSettingsResponse(
    val success: Boolean,
    val message: String,
    val data: PrintSettingsData
)

data class CustomerResponse(
    val success: Boolean,
    val message: String,
    val data: CustomerData,
    val statusCode: Int
)

data class CreateCustomerRequest(
    val name: String,
    val phone: String,
)
data class CustomerData(
    val id: String,
    val name: String,
    val phone: String,
    val is_guest: Int
)
