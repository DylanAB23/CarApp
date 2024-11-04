import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'cardealerpro.db');

const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS cars (
    id TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    status TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    carId TEXT NOT NULL,
    clientId TEXT NOT NULL,
    salePrice INTEGER NOT NULL,
    saleDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carId) REFERENCES cars(id),
    FOREIGN KEY (clientId) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    saleId TEXT NOT NULL,
    amount INTEGER NOT NULL,
    paymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (saleId) REFERENCES sales(id)
  );

  -- Insert some sample data
  INSERT OR IGNORE INTO cars (id, make, model, year, price, mileage, status, imageUrl) VALUES
    ('car-001', 'Toyota', 'Camry', 2020, 25000, 35000, 'available', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800'),
    ('car-002', 'Honda', 'Civic', 2021, 22000, 28000, 'pending', 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&w=800'),
    ('car-003', 'Tesla', 'Model 3', 2022, 45000, 15000, 'available', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800');
`);

console.log('Database setup completed');

db.close();