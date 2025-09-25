"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Search,
  Filter,
  Bell,
  Settings,
  LogOut,
  DollarSign,
  AlertCircle,
  type LucideIcon,
  Lock,
  User,
  Menu,
  X,
} from "lucide-react"
import ImageUpload from "@/components/image-upload"

// Props & data interfaces
interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: string | number
  changeType?: "positive" | "negative" | "neutral"
}

interface AuthState {
  isAuthenticated: boolean
  user: {
    email: string
    role: "admin" | "manager"
  } | null
}

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  description?: string
  image_url?: string
  status: string
}

interface Order {
  id: string
  customer: string
  items: number
  total: number
  status: string
  date: string
}

type NewProductState = {
  name: string
  category: string
  price: string
  stock: string
  description: string
  image_url: string
}

// --- AddProductModal (moved out so it won't remount on every ProductsTab render) ---
interface AddProductModalProps {
  show: boolean
  onClose: () => void
  newProduct: NewProductState
  setNewProduct: React.Dispatch<React.SetStateAction<NewProductState>>
  handleAddProduct: () => Promise<void> | void
  loading: boolean
  handleImageUpload: (url: string) => void
}

function AddProductModal({ show, onClose, newProduct, setNewProduct, handleAddProduct, loading, handleImageUpload }: AddProductModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Product</h3>
        <div className="space-y-4">
          <ImageUpload onImageUpload={handleImageUpload} currentImage={newProduct.image_url} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              value={newProduct.name}
              onChange={(e) => setNewProduct((s) => ({ ...s, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct((s) => ({ ...s, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select category</option>
              <option>Submersible Pumping</option>
              <option>EV Systems</option>
              <option>Car Wash Monitoring</option>
              <option>Integrated Electrical Controls</option>
              <option>Fuel Management Systems</option>
              <option>Piping & Containment</option>
              <option>Wire Management</option>
              <option>Service Station Hardware</option>
              <option>Dispensing</option>
              <option>Transport</option>
              <option>System Solutions</option>
              <option>Corrosion Control</option>
              <option>Special Offers</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct((s) => ({ ...s, price: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct((s) => ({ ...s, stock: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct((s) => ({ ...s, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter product description"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg">
              Cancel
            </button>
            <button onClick={handleAddProduct} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Main Dashboard Component ---
export default function MasgasDashboard()  {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null })
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([
    { id: "ORD-001", customer: "John Smith", items: 3, total: 8997, status: "pending", date: "2025-01-08" },
    { id: "ORD-002", customer: "Sarah Johnson", items: 1, total: 2599, status: "shipped", date: "2025-01-07" },
    { id: "ORD-003", customer: "Mike Davis", items: 2, total: 3748, status: "delivered", date: "2025-01-06" },
  ])

  const [newProduct, setNewProduct] = useState<NewProductState>({ name: "", category: "", price: "", stock: "", description: "", image_url: "" })
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterCategory, setFilterCategory] = useState<string>("")

  useEffect(() => {
    if (auth.isAuthenticated) loadProducts()
  }, [auth.isAuthenticated])

  // --- Auth ---
  const login = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = (formData.get("email") as string) || ""
    const password = (formData.get("password") as string) || ""
    const role = (formData.get("role") as string) || ""

    // Demo auth check using env vars (keeps original approach)
    if (
      (email === process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL && password === process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD && role === process.env.NEXT_PUBLIC_DEMO_ADMIN_ROLE) ||
      (email === process.env.NEXT_PUBLIC_DEMO_MANAGER_EMAIL && password === process.env.NEXT_PUBLIC_DEMO_MANAGER_PASSWORD && role === process.env.NEXT_PUBLIC_DEMO_MANAGER_ROLE)
    ) {
      setAuth({ isAuthenticated: true, user: { email, role: role as "admin" | "manager" } })
    } else {
      alert("Invalid credentials!!")
    }
  }

  const logout = () => {
    setAuth({ isAuthenticated: false, user: null })
    setActiveTab("overview")
  }

  // --- Products API ---
  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/products")
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (err) {
      console.error("Failed to load products:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock) {
      alert("Please provide name, category, price and stock")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          category: newProduct.category,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock, 10),
          description: newProduct.description,
          image_url: newProduct.image_url,
          status: "active",
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setProducts((prev) => [created, ...prev])
        setNewProduct({ name: "", category: "", price: "", stock: "", description: "", image_url: "" })
        setShowAddProduct(false)
      } else {
        const body = await res.text()
        console.error("Add product failed:", body)
        alert("Failed to add product")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to add product")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id))
      else alert("Failed to delete product")
    } catch (err) {
      console.error(err)
      alert("Failed to delete product")
    }
  }

  const handleImageUpload = (url: string) => setNewProduct((s) => ({ ...s, image_url: url }))

  // --- UI helpers ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // --- Small presentational components ---
  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs sm:text-sm mt-1 ${changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
              {changeType === "positive" ? "+" : ""}
              {change}% from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
        </div>
      </div>
    </div>
  )

  // --- Sidebar ---
  const Sidebar = () => (
    <aside
      className={`fixed z-40 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Masgas Dashboard</h2>
            <p className="text-xs text-gray-500">Wire & Cable Store</p>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {[{ id: "overview", label: "Overview", icon: TrendingUp }, { id: "products", label: "Products", icon: Package }, { id: "orders", label: "Orders", icon: ShoppingCart }, { id: "customers", label: "Customers", icon: Users }, { id: "settings", label: "Settings", icon: Settings }].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">{auth.user ? `Signed in as ${auth.user.email}` : "Not signed in"}</div>
          <button onClick={logout} className="w-full flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )

  // --- Tabs ---
  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Revenue" value="Ksh 12,847" icon={DollarSign} change="12.5" changeType="positive" />
        <StatCard title="Total Orders" value="156" icon={ShoppingCart} change="8.2" changeType="positive" />
        <StatCard title="Total Products" value={products.length} icon={Package} change="3.1" changeType="positive" />
        <StatCard title="Active Customers" value="89" icon={Users} change="5.4" changeType="positive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.customer}</p>
                </div>
                <div className="mt-2 sm:mt-0 text-left sm:text-right">
                  <p className="font-medium text-gray-900">Ksh {order.total}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
          <div className="space-y-3">
            {products.filter((p) => p.stock < 100).length === 0 ? (
              <p className="text-sm text-gray-500">No low stock products.</p>
            ) : (
              products.filter((p) => p.stock < 100).map((product) => (
                <div key={product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.stock} units left</p>
                    </div>
                  </div>
                  <button className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-3 sm:mt-0">Restock</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const ProductsTab = () => {
    const filtered = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory ? p.category === filterCategory : true
      return matchesSearch && matchesCategory
    })

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowAddProduct(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="flex items-center space-x-2">
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All categories</option>
                  <option>Submersible Pumping</option>
                  <option>EV Systems</option>
                  <option>Car Wash Monitoring</option>
                  <option>Wire Management</option>
                  <option>Special Offers</option>
                </select>
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </button>
              </div>
            </div>
          </div>

          {/* Desktop table (sm+) */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading products...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No products found</td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-gray-200 rounded-lg mr-4 overflow-hidden flex items-center justify-center">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-6 w-6 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.description && <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ksh {product.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>{product.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button className="text-blue-600 hover:text-blue-900"><Eye className="h-4 w-4" /></button>
                          <button className="text-green-600 hover:text-green-900"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile list (xs) */}
          <div className="sm:hidden p-4 space-y-3">
            {loading ? (
              <div className="text-center text-gray-500">Loading products...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-gray-500">No products found</div>
            ) : (
              filtered.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg mr-3 overflow-hidden flex items-center justify-center">
                      {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" /> : <Package className="h-6 w-6 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.category}</div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">Ksh {product.price}</div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-gray-500">{product.stock} in stock</div>
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600"><Eye className="h-4 w-4" /></button>
                          <button className="text-green-600"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Note: modal removed from here — it's rendered once below to avoid remounting on every change */}
        </div>
      </div>
    )
  }

  const OrdersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders</h2>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Filter className="h-4 w-4 mr-2" /> Filter</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.items}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ksh {order.total}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <button className="text-blue-600 hover:text-blue-900"><Eye className="h-4 w-4" /></button>
                    <button className="text-green-600 hover:text-green-900"><Edit3 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const CustomersTab = () => (
    <div className="text-center py-12">
      <p className="text-gray-500">Customers management coming soon...</p>
    </div>
  )

  const SettingsTab = () => (
    <div className="text-center py-12">
      <p className="text-gray-500">Settings panel coming soon...</p>
    </div>
  )

  const LoginForm = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to Masgas Dashboard</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Wire & Cable Store Management System</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={login}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input id="email" name="email" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter your email" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input id="password" name="password" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter your password" />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select id="role" name="role" required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg">
                <option value="">Select your role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
              <span className="absolute left-0 inset-y-0 flex items-center pl-3"><User className="h-5 w-5 text-blue-500" /></span>
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />
      case "products":
        return <ProductsTab />
      case "orders":
        return <OrdersTab />
      case "customers":
        return <CustomersTab />
      case "settings":
        return <SettingsTab />
      default:
        return <OverviewTab />
    }
  }

  // --- Render ---
  if (!auth.isAuthenticated) return <LoginForm />

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      {/* Overlay for mobile when sidebar open */}
      <div className={`fixed inset-0 z-30 bg-black bg-opacity-40 lg:hidden ${sidebarOpen ? "block" : "hidden"}`} onClick={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="lg:hidden p-1" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu className="h-6 w-6 text-gray-700" /></button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600"><Bell className="h-5 w-5 sm:h-6 sm:w-6" /></button>
            <div className="h-8 w-8 sm:h-9 sm:w-9 bg-blue-600 rounded-full flex items-center justify-center text-white">MG</div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">{renderContent()}</main>
      </div>

      {/* Add Product Modal moved outside ProductsTab to prevent focus loss */}
      <AddProductModal
        show={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleAddProduct={handleAddProduct}
        loading={loading}
        handleImageUpload={handleImageUpload}
      />
    </div>
  )
}

 