CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  sku VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  brand VARCHAR(80) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO products (sku, name, category, brand, description, price, stock) VALUES
('AUD-001', 'Audífonos inalámbricos', 'Audio', 'Sony', 'Audífonos Bluetooth con cancelación de ruido.', 2499.00, 18),
('TEL-001', 'Smartphone 128 GB', 'Telefonía', 'Samsung', 'Pantalla AMOLED, 128 GB de almacenamiento y cámara triple.', 8999.00, 12),
('LAP-001', 'Laptop 14 pulgadas', 'Computación', 'Lenovo', 'Laptop con 16 GB de RAM y SSD de 512 GB.', 16999.00, 7),
('TAB-001', 'Tablet 10 pulgadas', 'Computación', 'Apple', 'Tablet Wi-Fi con 64 GB de almacenamiento.', 9999.00, 9),
('MON-001', 'Monitor 27 pulgadas 4K', 'Monitores', 'LG', 'Monitor IPS 4K UHD con conexión HDMI y DisplayPort.', 7299.00, 6),
('TEC-001', 'Teclado mecánico RGB', 'Accesorios', 'Logitech', 'Teclado mecánico con iluminación RGB y conexión USB.', 1899.00, 15),
('MOU-001', 'Mouse inalámbrico', 'Accesorios', 'Logitech', 'Mouse óptico inalámbrico con receptor USB.', 649.00, 24),
('CAM-001', 'Cámara mirrorless', 'Fotografía', 'Canon', 'Cámara digital mirrorless con lente de 18-45 mm.', 15499.00, 4),
('CON-001', 'Consola de videojuegos', 'Videojuegos', 'Nintendo', 'Consola portátil con pantalla OLED y 64 GB.', 6999.00, 8),
('ALT-001', 'Bocina Bluetooth', 'Audio', 'JBL', 'Bocina portátil resistente al agua con hasta 12 horas de batería.', 1499.00, 20),
('SSD-001', 'SSD externo 1 TB', 'Almacenamiento', 'Samsung', 'Unidad de estado sólido externa USB-C.', 2199.00, 11),
('REL-001', 'Reloj inteligente', 'Wearables', 'Xiaomi', 'Reloj inteligente con monitor de actividad y GPS.', 1799.00, 13)
ON CONFLICT (sku) DO NOTHING;
