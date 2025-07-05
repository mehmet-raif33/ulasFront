-- Insert sample data
INSERT INTO users (email, name, role) VALUES 
('admin@ulastech.com', 'Admin User', 'admin'),
('user@ulastech.com', 'Regular User', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO vehicles (plate, brand, model, year, fuel_type, status) VALUES 
('34ABC123', 'Toyota', 'Corolla', 2020, 'Benzin', 'active'),
('06DEF456', 'Honda', 'Civic', 2019, 'Benzin', 'active'),
('35GHI789', 'Ford', 'Focus', 2021, 'Dizel', 'maintenance')
ON CONFLICT (plate) DO NOTHING;

INSERT INTO personnel (name, email, phone, department, position, status) VALUES 
('Ahmet Yılmaz', 'ahmet@ulastech.com', '0532 123 4567', 'Lojistik', 'Şoför', 'active'),
('Fatma Demir', 'fatma@ulastech.com', '0533 234 5678', 'İnsan Kaynakları', 'Müdür', 'active'),
('Mehmet Kaya', 'mehmet@ulastech.com', '0534 345 6789', 'Lojistik', 'Şoför', 'active')
ON CONFLICT (email) DO NOTHING; 