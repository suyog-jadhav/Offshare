package com.example.offsharexerox

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.offsharexerox.R

class PickedFilesAdapter(
    private val context: Context,
    private val uris: MutableList<Uri>,
    private val onListEmpty: () -> Unit
) : RecyclerView.Adapter<PickedFilesAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val image: ImageView = view.findViewById(R.id.imgPreview)
        val remove: ImageView = view.findViewById(R.id.btnRemove)
        val name: TextView = view.findViewById(R.id.tvFileName)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_picked_file, parent, false)
        return VH(view)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val uri = uris[position]

        // ✅ File name
        holder.name.text = getFileName(uri)

        // ✅ Preview logic
        val fileName = getFileName(uri).lowercase()

        if (fileName.endsWith(".pdf")) {
            // PDF icon preview
            holder.image.setImageResource(android.R.drawable.ic_menu_save)
        } else {
            // Image preview using Glide (CORRECT)
            Glide.with(holder.image.context)
                .load(uri)
                .placeholder(android.R.drawable.ic_menu_report_image)
                .error(android.R.drawable.ic_delete)
                .centerCrop()
                .into(holder.image)
        }

        // ✅ Remove item safely
        holder.remove.setOnClickListener {
            val pos = holder.adapterPosition
            if (pos != RecyclerView.NO_POSITION) {
                uris.removeAt(pos)
                notifyItemRemoved(pos)

                if (uris.isEmpty()) {
                    onListEmpty()
                }
            }
        }
    }

    override fun getItemCount() = uris.size

    private fun getFileName(uri: Uri): String {
        var name = "file"
        context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (index != -1 && cursor.moveToFirst()) {
                name = cursor.getString(index)
            }
        }
        return name
    }
}
