package com.example.offsharexerox

import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.util.Log
import android.view.View
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.offsharexerox.model.FileItem
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class UploadActivity : AppCompatActivity() {

    private lateinit var btnPickFiles: Button
    private lateinit var btnUpload: Button
    private lateinit var btnPrintSettings: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var tvStatus: TextView
    private lateinit var recyclerView: RecyclerView

    private val selectedUris = mutableListOf<Uri>()
    private val uploadedFiles = mutableListOf<FileItem>()
    private lateinit var adapter: FilesAdapter

    private lateinit var pickedAdapter: PickedFilesAdapter
    private lateinit var recyclerPickedFiles: RecyclerView
    private lateinit var tvPickedLabel: TextView

    private var isUploading = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_upload)

        // ===== FIND VIEWS =====
        btnPickFiles = findViewById(R.id.btnPickFiles)
        btnUpload = findViewById(R.id.btnUpload)
        btnPrintSettings = findViewById(R.id.btnPrintSettings)
        progressBar = findViewById(R.id.progressBar)
        tvStatus = findViewById(R.id.tvStatus)
        recyclerView = findViewById(R.id.recyclerViewFiles)

        tvPickedLabel = findViewById(R.id.tvPickedLabel)
        recyclerPickedFiles = findViewById(R.id.recyclerPickedFiles)

        // ===== INITIAL STATE =====
        progressBar.visibility = View.GONE
        btnUpload.isEnabled = false
        btnUpload.alpha = 0.5f
        tvPickedLabel.visibility = View.GONE
        recyclerPickedFiles.visibility = View.GONE

        // ===== PICKED FILES PREVIEW =====
        pickedAdapter = PickedFilesAdapter(this, selectedUris) {
            btnUpload.isEnabled = false
            btnUpload.alpha = 0.5f
        }

        recyclerPickedFiles.layoutManager =
            LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
        recyclerPickedFiles.adapter = pickedAdapter

        // ===== UPLOADED FILES LIST =====
        adapter = FilesAdapter(uploadedFiles) { file, position ->
            deleteFileFromBackend(file, position)
        }
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter

        // ===== BUTTON ACTIONS =====
        btnPickFiles.setOnClickListener {
            pickFilesLauncher.launch(arrayOf("application/pdf", "image/*"))
        }

        btnUpload.setOnClickListener {
            if (selectedUris.isEmpty()) {
                toast("Select files first")
                return@setOnClickListener
            }

            // 🔒 Disable immediately (ONE CLICK ONLY)
            btnUpload.isEnabled = false
            btnUpload.alpha = 0.5f

            uploadFiles()
        }


        btnPrintSettings.setOnClickListener {
            startActivity(Intent(this, PrintSettingsActivity::class.java))
        }

        fetchFiles()
    }
    private fun toast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }


    // ===== FILE PICKER =====
    private val pickFilesLauncher =
        registerForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) { uris ->

            if (uris.isNotEmpty()) {

                // ✅ Clear old selection
                selectedUris.clear()

                uris.forEach { uri ->
                    try {
                        // 🔥 VERY IMPORTANT: Persist permission
                        contentResolver.takePersistableUriPermission(
                            uri,
                            Intent.FLAG_GRANT_READ_URI_PERMISSION
                        )

                        selectedUris.add(uri)

                    } catch (e: SecurityException) {
                        e.printStackTrace()
                    }
                }

                // ✅ Notify adapter AFTER list update
                pickedAdapter.notifyDataSetChanged()

                // ✅ UI updates
                tvPickedLabel.visibility = View.VISIBLE
                recyclerPickedFiles.visibility = View.VISIBLE

                btnUpload.isEnabled = true
                btnUpload.alpha = 1f

                tvStatus.text = "Selected ${selectedUris.size} file(s)"
            }
        }

    // ===== UPLOAD =====
    private fun uploadFiles() {
        val sessionId = SessionManager.sessionId
        val customerId = SessionManager.customerId

        if (sessionId.isNullOrBlank() || customerId.isNullOrBlank()) {
            tvStatus.text = "Please reconnect to shop"
            tvStatus.setTextColor(Color.RED)
            return
        }

        btnUpload.isEnabled = false
        progressBar.visibility = View.VISIBLE
        tvStatus.text = "Uploading ${selectedUris.size} file(s)…"
        tvStatus.setTextColor(Color.DKGRAY)

        lifecycleScope.launch {
            try {
                val api = RetrofitClient
                    .get(SessionManager.apiBaseUrl)
                    .create(ApiService::class.java)

                val parts = selectedUris.map { uri ->
                    val bytes = contentResolver.openInputStream(uri)!!.readBytes()
                    MultipartBody.Part.createFormData(
                        "files",
                        getFileName(uri),
                        bytes.toRequestBody("*/*".toMediaTypeOrNull())
                    )
                }.toTypedArray()

                val response = api.uploadFiles(
                    sessionId.toRequestBody("text/plain".toMediaTypeOrNull()),
                    customerId.toRequestBody("text/plain".toMediaTypeOrNull()),
                    parts
                )

                uploadedFiles.clear()
                uploadedFiles.addAll(response.data)
                adapter.notifyDataSetChanged()

                selectedUris.clear()
                pickedAdapter.notifyDataSetChanged()
                tvPickedLabel.visibility = View.GONE
                recyclerPickedFiles.visibility = View.GONE

                tvStatus.text = "Upload successful ✔"
                tvStatus.setTextColor(Color.parseColor("#16A34A"))

            } catch (e: Exception) {
                Log.e("UPLOAD", "Failed", e)
                tvStatus.text = "Upload failed"
                tvStatus.setTextColor(Color.RED)
                btnUpload.isEnabled = true
                btnUpload.alpha = 1f
            } finally {
                progressBar.visibility = View.GONE
                isUploading = false
                btnUpload.alpha = 1f
            }
        }
    }

    // ===== FETCH =====
    private fun fetchFiles() {
        val sessionId = SessionManager.sessionId ?: return
        lifecycleScope.launch {
            try {
                val api = RetrofitClient
                    .get(SessionManager.apiBaseUrl)
                    .create(ApiService::class.java)

                val response = api.getFilesForSession(sessionId)
                uploadedFiles.clear()
                uploadedFiles.addAll(response.data)
                adapter.notifyDataSetChanged()
            } catch (_: Exception) {}
        }
    }

    private fun getFileName(uri: Uri): String {
        var name = "file"
        contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (cursor.moveToFirst() && index != -1) {
                name = cursor.getString(index)
            }
        }
        return name
    }

    private fun deleteFileFromBackend(file: FileItem, position: Int) {

        val sessionId = SessionManager.sessionId ?: return

        lifecycleScope.launch {
            try {
                val api = RetrofitClient
                    .get(SessionManager.apiBaseUrl)
                    .create(ApiService::class.java)

                api.deleteFile(
                    sessionId = sessionId,
                    fileId = file.id
                )

                // ✅ Remove from UI ONLY after success
                uploadedFiles.removeAt(position)
                adapter.notifyItemRemoved(position)

                toast("File deleted")

            } catch (e: Exception) {
                Log.e("DELETE_FILE", "Failed", e)
                toast("Failed to delete file")
            }
        }
    }

}
