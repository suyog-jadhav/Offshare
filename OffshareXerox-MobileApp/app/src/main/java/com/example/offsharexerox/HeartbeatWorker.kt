package com.example.offsharexerox

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class HeartbeatWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {

        val sessionId = SessionManager.sessionId
        val apiBaseUrl = SessionManager.apiBaseUrl

        if (sessionId.isNullOrEmpty() || apiBaseUrl.isNullOrEmpty()) {
            Log.e("HeartbeatWorker", "Session missing")
            return Result.failure()
        }

        return try {
            val api = RetrofitClient
                .get(apiBaseUrl)
                .create(ApiService::class.java)

            val response = api.heartbeat(
                mapOf("session_id" to sessionId)
            )

            if (response.isSuccessful) {
                Log.d("HeartbeatWorker", "Heartbeat OK")
                Result.success()
            } else {
                Log.e("HeartbeatWorker", "Heartbeat failed")
                Result.retry()
            }

        } catch (e: Exception) {
            Log.e("HeartbeatWorker", "Exception", e)
            Result.retry()
        }
    }
}
