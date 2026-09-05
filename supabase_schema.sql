-- ==========================================================
-- LUSSO BEAUTY SALÓN — ESQUEMA DE BASE DE DATOS POSTGRESQL (SUPABASE)
-- Ejecuta este script en el "SQL Editor" de tu panel de Supabase
-- Proyecto: crwohdkuwygjgoyvmywh
-- ==========================================================

-- 1. TABLA: CLIENTAS (Directorio y Ficha 360°)
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    technical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA: VENTAS / SERVICIOS (Punto de Venta POS)
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT DEFAULT '12:00',
    client_name TEXT NOT NULL,
    specialist TEXT NOT NULL,
    service TEXT NOT NULL,
    supplies TEXT,
    drinks TEXT,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tip NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    commission NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    commission_reason TEXT,
    payment_method TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA: AGENDA & CITAS
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    service TEXT NOT NULL,
    specialist TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    amount NUMERIC(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA: INVENTARIO DE INSUMOS
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    stock NUMERIC(10,2) NOT NULL DEFAULT 0,
    min_stock NUMERIC(10,2) NOT NULL DEFAULT 2,
    unit TEXT NOT NULL DEFAULT 'Unidades',
    cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    supplier TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA: ASISTENCIA, FALTAS Y NÓMINA
CREATE TABLE IF NOT EXISTS absences (
    id TEXT PRIMARY KEY,
    specialist TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL,
    reason TEXT NOT NULL,
    amount NUMERIC(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. TABLA: GASTOS DE CAJA CHICA
CREATE TABLE IF NOT EXISTS petty_cash (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. TABLA: FACTURAS DE PROVEEDORES
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. HABILITAR ROW LEVEL SECURITY (RLS) CON ACCESO PÚBLICO ANON
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura/escritura anónimas autorizadas
CREATE POLICY "Permitir todo a anon clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a anon sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a anon appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a anon inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a anon absences" ON absences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a anon petty_cash" ON petty_cash FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a anon invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
