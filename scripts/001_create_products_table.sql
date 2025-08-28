-- Create products table with image support
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  image_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, category, price, stock, description, image_url, status) VALUES
('Copper Wire 14AWG', 'Electrical Wire', 25.99, 150, 'High-quality copper wire for electrical installations', '/placeholder.svg?height=80&width=80', 'active'),
('Aluminum Wire 12AWG', 'Electrical Wire', 18.50, 75, 'Lightweight aluminum wire for residential use', '/placeholder.svg?height=80&width=80', 'active'),
('Speaker Wire 16AWG', 'Audio Wire', 12.99, 200, 'Premium speaker wire for audio systems', '/placeholder.svg?height=80&width=80', 'active'),
('Cat6 Ethernet Cable', 'Network Cable', 35.99, 120, 'High-speed ethernet cable for networking', '/placeholder.svg?height=80&width=80', 'active'),
('Coaxial Cable RG6', 'Coaxial Cable', 22.50, 90, 'Premium coaxial cable for TV and internet', '/placeholder.svg?height=80&width=80', 'active');
