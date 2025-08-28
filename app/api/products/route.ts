import { type NextRequest, NextResponse } from "next/server"
import { getProducts, createProduct } from "@/lib/database"

export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, price, stock, description, image_url } = body

    if (!name || !category || !price || stock === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const product = await createProduct({
      name,
      category,
      price: Number.parseFloat(price),
      stock: Number.parseInt(stock),
      description: description || "",
      image_url: image_url || "",
      status: "active",
    })

    if (!product) {
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
