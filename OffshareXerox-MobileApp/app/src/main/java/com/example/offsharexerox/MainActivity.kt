package com.example.offsharexerox

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var btnConnect: Button
    private lateinit var storage: LocalStorage

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        storage = LocalStorage(this)

        // First-time user → onboarding
        if (!storage.isCustomerSaved()) {
            startActivity(Intent(this, OnboardingActivity::class.java))
            finish()
            return
        }

        setContentView(R.layout.activity_main)

        btnConnect = findViewById(R.id.btnConnect)

        btnConnect.setOnClickListener {
            startActivity(Intent(this, QrScanActivity::class.java))
        }
    }
}
