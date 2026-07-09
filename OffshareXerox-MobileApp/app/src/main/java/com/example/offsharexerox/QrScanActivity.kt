package com.example.offsharexerox

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.wifi.WifiManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.example.offsharexerox.model.CreateCustomerRequest
import com.google.gson.Gson
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.util.concurrent.TimeUnit

/* ===================== MODELS ===================== */

data class QrPayload(
    val ssid: String,
    val password: String,
    val auth: String,
    val apiBaseUrl: String
)

/* ===================== ACTIVITY ===================== */

class QrScanActivity : AppCompatActivity() {

    private lateinit var tvStatus: TextView
    private lateinit var btnRetry: Button
    private lateinit var storage: LocalStorage

    private var qrHandled = false
    private lateinit var scannedPayload: QrPayload

    /* ===================== QR SCANNER ===================== */

    private val qrScanner =
        registerForActivityResult(ScanContract()) { result ->
            if (result.contents != null) {
                handleQr(result.contents)
            } else {
                tvStatus.text = "QR scan cancelled"
                btnRetry.visibility = View.VISIBLE
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qr_scan)

        tvStatus = findViewById(R.id.tvStatus)
        btnRetry = findViewById(R.id.btnRetry)
        storage = LocalStorage(this)

        btnRetry.visibility = View.GONE
        tvStatus.text = "Scan QR from shop PC"

        btnRetry.setOnClickListener {
            btnRetry.visibility = View.GONE
            qrHandled = false
            startQrScan()
        }

        if (!hasLocationPermission()) {
            requestLocationPermission()
        } else {
            startQrScan()
        }
    }

    /* ===================== QR ===================== */

    private fun startQrScan() {
        val options = ScanOptions().apply {
            setPrompt("Scan QR Code")
            setBeepEnabled(false)
            setOrientationLocked(true)

            // 🔥 FORCE PORTRAIT CAMERA
            setCaptureActivity(PortraitCaptureActivity::class.java)
        }
        qrScanner.launch(options)
    }


    private fun handleQr(qrText: String) {
        if (qrHandled) return
        qrHandled = true

        try {
            scannedPayload = Gson().fromJson(qrText, QrPayload::class.java)

            // ⚠️ Add /api ONLY if backend uses it
            SessionManager.apiBaseUrl = scannedPayload.apiBaseUrl + "/api/"
            Log.d("QR", "API Base URL → ${SessionManager.apiBaseUrl}")

            tvStatus.text = "QR scanned. Checking Wi-Fi…"
            checkWifi()

        } catch (e: Exception) {
            qrHandled = false
            tvStatus.text = "Invalid QR"
            btnRetry.visibility = View.VISIBLE
        }
    }

    /* ===================== WIFI ===================== */

    private fun checkWifi() {
        val wifiManager =
            applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager

        if (!wifiManager.isWifiEnabled) {
            showWifiDialog()
        } else {
            connectWifi()
        }
    }

    private fun showWifiDialog() {
        val dialog = AlertDialog.Builder(this)
            .setTitle("Wi-Fi Required")
            .setMessage("Turn on Wi-Fi to connect to the shop")
            .setPositiveButton("Turn On") { _, _ ->
                startActivity(Intent(Settings.ACTION_WIFI_SETTINGS))
            }
            .setCancelable(true)
            .create()

        dialog.show()

        lifecycleScope.launch {
            delay(3500)
            if (dialog.isShowing) dialog.dismiss()
            btnRetry.visibility = View.VISIBLE
        }
    }

    override fun onResume() {
        super.onResume()
        if (::scannedPayload.isInitialized) {
            val wifiManager =
                applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            if (wifiManager.isWifiEnabled) {
                connectWifi()
            }
        }
    }

    private fun connectWifi() {
        tvStatus.text = "Connecting to shop Wi-Fi…"

        WifiConnector(this).connect(
            ssid = scannedPayload.ssid,
            password = scannedPayload.password,
            onSuccess = {
                runOnUiThread {
                    tvStatus.text = "Wi-Fi connected. Starting session…"
                    startSession()
                }
            },
            onFailure = {
                runOnUiThread {
                    tvStatus.text = "Wi-Fi connection failed"
                    btnRetry.visibility = View.VISIBLE
                }
            }
        )
    }

    /* ===================== SESSION ===================== */

    private fun startSession() {
        lifecycleScope.launch {
            try {
                val api = RetrofitClient
                    .get(SessionManager.apiBaseUrl)
                    .create(ApiService::class.java)

                val body = mutableMapOf(
                    "device_name" to Build.MODEL,
                    "device_type" to "android"
                )

                storage.getDeviceId()?.let {
                    body["device_id"] = it
                }

                val response = api.startSession(body)

                if (!response.success) {
                    tvStatus.text = "Session rejected"
                    btnRetry.visibility = View.VISIBLE
                    return@launch
                }

                SessionManager.sessionId = response.data.session_id
                SessionManager.deviceId = response.data.device_id

                if (storage.getDeviceId() == null) {
                    storage.saveDeviceId(response.data.device_id)
                }

                Log.d("SESSION", "Session started → ${response.data.session_id}")

                createCustomerIfNeeded(api)
                startHeartbeat()

                startActivity(Intent(this@QrScanActivity, UploadActivity::class.java))
                finish()

            } catch (e: Exception) {
                tvStatus.text = "Session failed"
                btnRetry.visibility = View.VISIBLE
                Log.e("SESSION", "Session error", e)
            }
        }
    }

    /* ===================== CUSTOMER ===================== */

    private suspend fun createCustomerIfNeeded(api: ApiService) {

        storage.getCustomerId()?.let {
            SessionManager.customerId = it
            Log.d("CUSTOMER", "Customer already exists locally → $it")
            return
        }

        val name = storage.getCustomerName() ?: return
        val phone = storage.getCustomerPhone() ?: return

        try {
            val response = api.createCustomer(
                CreateCustomerRequest(name, phone)
            )

            if (response.success) {
                val id = response.data.id
                storage.saveCustomerId(id)
                SessionManager.customerId = id
                Log.d("CUSTOMER", "Customer created → $id")
            }

        } catch (e: HttpException) {
            if (e.code() == 409) {
                Log.d("CUSTOMER", "Customer already exists on server (409)")
            } else {
                Log.e("CUSTOMER", "Customer creation failed", e)
            }
        } catch (e: Exception) {
            Log.e("CUSTOMER", "Customer creation error", e)
        }
    }

    /* ===================== HEARTBEAT ===================== */

    private fun startHeartbeat() {
        val request =
            PeriodicWorkRequestBuilder<HeartbeatWorker>(15, TimeUnit.MINUTES).build()

        WorkManager.getInstance(this)
            .enqueueUniquePeriodicWork(
                "heartbeat",
                ExistingPeriodicWorkPolicy.REPLACE,
                request
            )
    }

    /* ===================== PERMISSIONS ===================== */

    private fun hasLocationPermission(): Boolean =
        ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

    private fun requestLocationPermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
            101
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        if (requestCode == 101 &&
            grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            startQrScan()
        } else {
            tvStatus.text = "Location permission required"
            btnRetry.visibility = View.VISIBLE
        }
    }
}
