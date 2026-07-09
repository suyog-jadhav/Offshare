package com.example.offsharexerox

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.offsharexerox.model.FileItem

class FilesAdapter(
    private val files: MutableList<FileItem>,
    private val onDeleteClick: (FileItem, Int) -> Unit
) : RecyclerView.Adapter<FilesAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val imgPreview: ImageView = view.findViewById(R.id.imgPreview)
        val tvFileName: TextView = view.findViewById(R.id.tvFileName)
        val btnDelete: ImageButton = view.findViewById(R.id.btnDelete)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_uploaded_file, parent, false)
        return VH(view)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val file = files[position]

        holder.tvFileName.text = file.original_name ?: "Document"

        // 🔒 CLEAR OLD IMAGE (VERY IMPORTANT)
        Glide.with(holder.itemView.context).clear(holder.imgPreview)

        Log.d("IMAGE_URL", file.url ?: "URL NULL")

        // 📄 PDF preview
        if (file.original_name?.endsWith(".pdf", true) == true) {
            holder.imgPreview.setImageResource(android.R.drawable.ic_menu_save)
        }
        // 🖼 Image preview (NULL SAFE)
        else if (!file.url.isNullOrEmpty()) {
            Glide.with(holder.itemView.context)
                .load(file.url)
                .placeholder(android.R.drawable.ic_menu_report_image)
                .error(android.R.drawable.ic_delete) // 👈 ADD THIS
                .centerCrop()
                .into(holder.imgPreview)
        }
        // ❌ No image available
        else {
            holder.imgPreview.setImageResource(
                android.R.drawable.ic_menu_close_clear_cancel
            )
        }

        holder.btnDelete.setOnClickListener {
            onDeleteClick(file, holder.adapterPosition)
        }
    }

    override fun onViewRecycled(holder: VH) {
        Glide.with(holder.itemView.context).clear(holder.imgPreview)
        super.onViewRecycled(holder)
    }

    override fun getItemCount(): Int = files.size
}
