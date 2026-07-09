package com.example.offsharexerox

import android.os.Bundle
import android.util.Log
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.offsharexerox.model.PrintSettingsData
import com.example.offsharexerox.model.PrintSettingsRequest
import kotlinx.coroutines.launch

class PrintSettingsActivity : AppCompatActivity() {

    private var copiesCount = 1
    private var isSaving = false   // 🔒 prevent double save

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_print_settings)

        /* ===================== FIND VIEWS ===================== */

        val spinnerColor = findViewById<Spinner>(R.id.spinnerColor)
        val spinnerPaper = findViewById<Spinner>(R.id.spinnerPaper)
        val spinnerSides = findViewById<Spinner>(R.id.spinnerSides)
        val spinnerOrientation = findViewById<Spinner>(R.id.spinnerOrientation)

        val btnMinus = findViewById<Button>(R.id.btnMinus)
        val btnPlus = findViewById<Button>(R.id.btnPlus)
        val tvCopies = findViewById<TextView>(R.id.tvCopies)

        val btnSave = findViewById<Button>(R.id.btnSave)
        val btnGoBack = findViewById<Button>(R.id.btnGoBack)
        val tvStatus = findViewById<TextView>(R.id.tvStatus)

        /* ===================== SPINNERS ===================== */

        spinnerColor.adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_dropdown_item,
            listOf("BW", "COLOR")
        )

        spinnerPaper.adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_dropdown_item,
            listOf("A4", "A3")
        )

        spinnerSides.adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_dropdown_item,
            listOf("SINGLE", "DOUBLE")
        )

        spinnerOrientation.adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_dropdown_item,
            listOf("PORTRAIT", "LANDSCAPE")
        )

        /* ===================== COPIES (+ / -) ===================== */

        tvCopies.text = copiesCount.toString()

        btnMinus.setOnClickListener {
            if (copiesCount > 1) {
                copiesCount--
                tvCopies.text = copiesCount.toString()
            }
        }

        btnPlus.setOnClickListener {
            copiesCount++
            tvCopies.text = copiesCount.toString()
        }

        /* ===================== LOAD EXISTING SETTINGS ===================== */

        fetchExistingSettings(
            spinnerColor,
            spinnerPaper,
            spinnerSides,
            spinnerOrientation,
            tvCopies
        )

        /* ===================== SAVE SETTINGS ===================== */

        btnSave.setOnClickListener {
            if (isSaving) return@setOnClickListener   // 🔒 HARD BLOCK

            isSaving = true
            btnSave.isEnabled = false
            btnSave.alpha = 0.6f
            tvStatus.text = "Saving print settings…"

            val settings = PrintSettingsData(
                color_mode = spinnerColor.selectedItem.toString(),
                paper_size = spinnerPaper.selectedItem.toString(),
                sides = spinnerSides.selectedItem.toString(),
                orientation = spinnerOrientation.selectedItem.toString(),
                copies = copiesCount
            )

            savePrintSettings(settings, tvStatus, btnSave)
        }

        /* ===================== GO BACK ===================== */

        btnGoBack.setOnClickListener {
            finish() // 👈 back to UploadActivity
        }
    }

    /* ===================== API: SAVE ===================== */

    private fun savePrintSettings(
        settings: PrintSettingsData,
        tvStatus: TextView,
        btnSave: Button
    ) {
        lifecycleScope.launch {
            try {
                val api = RetrofitClient
                    .get(SessionManager.apiBaseUrl)
                    .create(ApiService::class.java)

                val request = PrintSettingsRequest(
                    session_id = SessionManager.sessionId!!,
                    settings = settings
                )

                api.createPrintSettings(request)

                tvStatus.text = "Print settings saved ✔"

            } catch (e: Exception) {
                Log.e("PRINT_SETTINGS", "Save failed", e)
                tvStatus.text = "Failed to save print settings"
                btnSave.isEnabled = true
                btnSave.alpha = 1f
            } finally {
                // 🔓 unlock save if user wants to change again
                isSaving = false
            }
        }
    }

    /* ===================== API: FETCH ===================== */

    private fun fetchExistingSettings(
        spinnerColor: Spinner,
        spinnerPaper: Spinner,
        spinnerSides: Spinner,
        spinnerOrientation: Spinner,
        tvCopies: TextView
    ) {
        lifecycleScope.launch {
            try {
                val sessionId = SessionManager.sessionId ?: return@launch

                val api = RetrofitClient
                    .get(SessionManager.apiBaseUrl)
                    .create(ApiService::class.java)

                val response = api.getPrintSettings(sessionId)
                val data = response.data ?: return@launch

                spinnerColor.setSelection(
                    (spinnerColor.adapter as ArrayAdapter<String>)
                        .getPosition(data.color_mode)
                )

                spinnerPaper.setSelection(
                    (spinnerPaper.adapter as ArrayAdapter<String>)
                        .getPosition(data.paper_size)
                )

                spinnerSides.setSelection(
                    (spinnerSides.adapter as ArrayAdapter<String>)
                        .getPosition(data.sides)
                )

                spinnerOrientation.setSelection(
                    (spinnerOrientation.adapter as ArrayAdapter<String>)
                        .getPosition(data.orientation)
                )

                copiesCount = maxOf(1, data.copies)
                tvCopies.text = copiesCount.toString()

            } catch (e: Exception) {
                Log.e("PRINT_SETTINGS", "Fetch failed", e)
            }
        }
    }
}
