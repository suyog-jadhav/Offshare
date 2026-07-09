package com.example.offsharexerox

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class OnboardingActivity : AppCompatActivity() {

    private lateinit var etName: EditText
    private lateinit var etPhone: EditText
    private lateinit var btnContinue: Button
    private lateinit var storage: LocalStorage

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_onboarding)

        storage = LocalStorage(this)

        /* 🔁 If user already exists → skip onboarding */
        if (storage.isCustomerSaved()) {
            startActivity(Intent(this, QrScanActivity::class.java))
            finish()
            return
        }

        etName = findViewById(R.id.etName)
        etPhone = findViewById(R.id.etPhone)
        btnContinue = findViewById(R.id.btnContinue)

        btnContinue.setOnClickListener {
            val name = etName.text.toString().trim()
            val phone = etPhone.text.toString().trim()

            if (name.isEmpty()) {
                etName.error = "Enter name"
                return@setOnClickListener
            }

            if (phone.length < 10) {
                etPhone.error = "Enter valid phone"
                return@setOnClickListener
            }

            storage.saveCustomer(name, phone)

            // 🔥 Go to MAIN, not QR
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }

    }
}
