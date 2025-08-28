
"use client"

import { useState } from "react"

export default function AddProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    specs: "",
    price: "",
    image: "", // Will hold image URL or base64 string
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert("Product added successfully!")
        setFormData({ name: "", specs: "", price: "", image: "" })
      } else {
        alert("Failed to add product")
      }
    } catch (error) {
      console.error("Error adding product:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        required
      />
      <textarea
        name="specs"
        placeholder="Product Specs"
        value={formData.specs}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        required
      />
      <input
        type="text"
        name="price"
        placeholder="Product Price"
        value={formData.price}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        required
      />
      <input
        type="text"
        name="image"
        placeholder="Image URL (or base64)"
        value={formData.image}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Product
      </button>
    </form>
  )
}
