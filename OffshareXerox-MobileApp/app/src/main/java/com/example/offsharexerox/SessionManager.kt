package com.example.offsharexerox

import android.net.Uri

object SessionManager {

    var sessionId: String = ""
    var apiBaseUrl: String = ""

    // OPTIONAL
    var customerId: String? = null
    var deviceId:String?=null
    var pickedUris = mutableListOf<Uri>()

    fun clear() {
        sessionId = ""
        apiBaseUrl = ""
        customerId = null
    }
}
