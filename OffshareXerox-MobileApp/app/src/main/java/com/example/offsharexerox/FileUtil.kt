package com.example.offsharexerox

import android.content.Context
import android.net.Uri
import java.io.File

object FileUtil {

    fun from(context: Context, uri: Uri): File {
        val inputStream = context.contentResolver.openInputStream(uri)
            ?: throw IllegalArgumentException("Cannot open input stream")

        val file = File(context.cacheDir, getFileName(context, uri))
        val outputStream = file.outputStream()

        inputStream.copyTo(outputStream)

        inputStream.close()
        outputStream.close()

        return file
    }

    private fun getFileName(context: Context, uri: Uri): String {
        var name = "file"
        val cursor = context.contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val index = it.getColumnIndex("_display_name")
                if (index != -1) {
                    name = it.getString(index)
                }
            }
        }
        return name
    }
}
