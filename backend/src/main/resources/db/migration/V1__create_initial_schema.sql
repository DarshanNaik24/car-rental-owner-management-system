-- Car Rental Owner Management System: Initial Schema
-- Flyway Migration V1

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    variant VARCHAR(50),
    fuel_type VARCHAR(30) NOT NULL,
    transmission VARCHAR(30) NOT NULL,
    current_odometer INTEGER NOT NULL DEFAULT 0,
    manufacturing_year INTEGER,
    notes TEXT,
    image_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_reg ON vehicles(registration_number);

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    primary_phone VARCHAR(25) NOT NULL,
    alternate_phone VARCHAR(25),
    email VARCHAR(150),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(full_name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(primary_phone);

CREATE TABLE IF NOT EXISTS rentals (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    pickup_datetime TIMESTAMP NOT NULL,
    expected_return_datetime TIMESTAMP NOT NULL,
    actual_return_datetime TIMESTAMP,
    pickup_odometer INTEGER NOT NULL,
    return_odometer INTEGER,
    pickup_fuel_level VARCHAR(50) NOT NULL,
    return_fuel_level VARCHAR(50),
    agreed_rental_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    additional_charges NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_rental_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    pickup_notes TEXT,
    return_notes TEXT,
    damage_notes TEXT,
    missing_accessories TEXT,
    total_kilometers INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rentals_vehicle ON rentals(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rentals_customer ON rentals(customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_dates ON rentals(pickup_datetime, actual_return_datetime);

CREATE TABLE IF NOT EXISTS checklist_items (
    id BIGSERIAL PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspections (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
    type VARCHAR(30) NOT NULL,
    inspection_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    inspector_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inspections_rental ON inspections(rental_id);
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle ON inspections(vehicle_id);

CREATE TABLE IF NOT EXISTS inspection_results (
    id BIGSERIAL PRIMARY KEY,
    inspection_id BIGINT NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    checklist_item_id BIGINT NOT NULL REFERENCES checklist_items(id),
    item_name VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL,
    notes TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inspection_results_inspection ON inspection_results(inspection_id);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_rental ON payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_datetime);

CREATE TABLE IF NOT EXISTS rental_photos (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT REFERENCES rentals(id) ON DELETE CASCADE,
    vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
    inspection_id BIGINT REFERENCES inspections(id) ON DELETE SET NULL,
    photo_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    photo_type VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photos_rental ON rental_photos(rental_id);
CREATE INDEX IF NOT EXISTS idx_photos_vehicle ON rental_photos(vehicle_id);

