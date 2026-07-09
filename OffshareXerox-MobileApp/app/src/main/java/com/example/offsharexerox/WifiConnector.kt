package com.example.offsharexerox

import android.content.Context
import android.net.*
import android.net.wifi.WifiNetworkSpecifier

class WifiConnector(private val context: Context) {

    fun connect(
        ssid: String,
        password: String,
        onSuccess: () -> Unit,
        onFailure: () -> Unit
    ) {
        val specifier = WifiNetworkSpecifier.Builder()
            .setSsid(ssid)
            .setWpa2Passphrase(password)
            .build()

        val request = NetworkRequest.Builder()
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .setNetworkSpecifier(specifier)
            .build()

        val connectivityManager =
            context.getSystemService(Context.CONNECTIVITY_SERVICE)
                    as ConnectivityManager

        connectivityManager.requestNetwork(
            request,
            object : ConnectivityManager.NetworkCallback() {

                override fun onAvailable(network: Network) {
                    connectivityManager.bindProcessToNetwork(network)
                    onSuccess()
                }

                override fun onUnavailable() {
                    onFailure()
                }
            }
        )
    }
}
