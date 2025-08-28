import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

export interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  description?: string
  image_url?: string
  status: string
  created_at: string
  updated_at: string
}

export async function getProducts(): Promise<Product[]> {
  try {
    const products = await sql`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `
    return products as Product[]
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  try {
    const [newProduct] = await sql`
      INSERT INTO products (name, category, price, stock, description, image_url, status)
      VALUES (${product.name}, ${product.category}, ${product.price}, ${product.stock}, ${product.description || ""}, ${product.image_url || ""}, ${product.status})
      RETURNING *
    `
    return newProduct as Product
  } catch (error) {
    console.error("Error creating product:", error)
    return null
  }
}

export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
  try {
    const [updatedProduct] = await sql`
      UPDATE products 
      SET 
        name = COALESCE(${updates.name}, name),
        category = COALESCE(${updates.category}, category),
        price = COALESCE(${updates.price}, price),
        stock = COALESCE(${updates.stock}, stock),
        description = COALESCE(${updates.description}, description),
        image_url = COALESCE(${updates.image_url}, image_url),
        status = COALESCE(${updates.status}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return updatedProduct as Product
  } catch (error) {
    console.error("Error updating product:", error)
    return null
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM products WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting product:", error)
    return false
  }
}
