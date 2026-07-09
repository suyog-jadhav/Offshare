package com.example.offsharexerox

import com.example.offsharexerox.model.CreateCustomerRequest
import com.example.offsharexerox.model.CustomerResponse
import com.example.offsharexerox.model.FilesResponse
import com.example.offsharexerox.model.PrintSettingsData
import com.example.offsharexerox.model.PrintSettingsRequest
import com.example.offsharexerox.model.PrintSettingsResponse
import com.example.offsharexerox.model.StartSessionResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    /* ================= SESSION ================= */

    @POST("session/start")
    suspend fun startSession(
        @Body body: Map<String, String>
    ): StartSessionResponse

    @POST("session/heartbeat")
    suspend fun heartbeat(
        @Body body: Map<String, String>
    ): Response<Unit>

    @POST("session/end")
    suspend fun endSession(
        @Body body: Map<String, String>
    ): Response<Unit>

    /* ================= FILE UPLOAD ================= */

    @Multipart
    @POST("files/upload")
    suspend fun uploadFiles(
        @Part("session_id") sessionId: RequestBody,
        @Part("customer_id") customerId: RequestBody,
        @Part files: Array<MultipartBody.Part>
    ): FilesResponse

    @GET("files/session/{session_id}")
    suspend fun getFilesForSession(
        @Path("session_id") sessionId: String
    ): FilesResponse

    @DELETE("files/session/{session_id}/file/{id}")
    suspend fun deleteFile(
        @Path("session_id") sessionId: String,
        @Path("id") fileId: String
    ): Response<Unit>

    /* ================= PRINT SETTINGS ================= */

    @POST("print/settings")
    suspend fun createPrintSettings(
        @Body body: PrintSettingsRequest
    ): PrintSettingsResponse

    @PUT("print/settings/{session_id}")
    suspend fun updatePrintSettings(
        @Path("session_id") sessionId: String,
        @Body body: Map<String, PrintSettingsData>
    ): PrintSettingsResponse

    @GET("print/settings/{session_id}")
    suspend fun getPrintSettings(
        @Path("session_id") sessionId: String
    ): PrintSettingsResponse

    /* ================= CUSTOMER ================= */

    @POST("customer/create")
    suspend fun createCustomer(
        @Body body: CreateCustomerRequest
    ): CustomerResponse

}
