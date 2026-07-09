package com.example.offsharexerox

import android.content.Context

class LocalStorage(context: Context) {

    private val prefs =
        context.getSharedPreferences("offshare_prefs", Context.MODE_PRIVATE)

    /* -------- CUSTOMER -------- */

    fun saveCustomer(name: String, phone: String) {
        prefs.edit()
            .putString("customer_name", name)
            .putString("customer_phone", phone)
            .apply()
    }

    fun getCustomerName(): String? =
        prefs.getString("customer_name", null)

    fun getCustomerPhone(): String? =
        prefs.getString("customer_phone", null)

    fun isCustomerSaved(): Boolean =
        getCustomerName() != null && getCustomerPhone() != null

    /* -------- DEVICE -------- */

    fun saveDeviceId(deviceId: String) {
        prefs.edit()
            .putString("device_id", deviceId)
            .apply()
    }

    fun getDeviceId(): String? =
        prefs.getString("device_id", null)
    /* -------- CUSTOMER ID -------- */

    fun saveCustomerId(customerId: String) {
        prefs.edit()
            .putString("customer_id", customerId)
            .apply()
    }

    fun getCustomerId(): String? =
        prefs.getString("customer_id", null)

    fun isCustomerIdSaved(): Boolean =
        getCustomerId() != null

}
