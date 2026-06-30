-- ─────────────────────────────────────────────────────────────────────────────
-- NIC SCMS  ―  Full database setup (idempotent, safe to re-run)
-- Reference: scms_intent-portal-main/backend/setup.sql  (indent tables)
-- Extended : NIC portal tables (users, notifications+, employees, materials,
--            stores, suppliers, inventory, manufacture, chat, purchases)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS scms AUTHORIZATION postgres;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 1 — Reference project tables (copied verbatim from intent portal)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scms.indent_master
(
    indent_id         SERIAL PRIMARY KEY,
    indent_no         VARCHAR(50) UNIQUE NOT NULL,
    item_name         VARCHAR(300) NOT NULL,
    quantity          INTEGER NOT NULL,
    uom               VARCHAR(50),
    requested_by      INTEGER NOT NULL,
    requested_by_name VARCHAR(200),
    approver_id       INTEGER,
    store_id          INTEGER,
    dept_code         INTEGER,
    dist_code         INTEGER,
    purpose           TEXT,
    status            VARCHAR(20) DEFAULT 'PENDING',
    remarks           TEXT,
    approved_by       INTEGER,
    approved_by_name  VARCHAR(200),
    approved_on       TIMESTAMP WITH TIME ZONE,
    created_on        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_on        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION scms.notify_indent()
RETURNS trigger AS $$
DECLARE
    payload JSON;
BEGIN
    payload = json_build_object(
        'indent_id',  NEW.indent_id,
        'indent_no',  NEW.indent_no,
        'item_name',  NEW.item_name,
        'quantity',   NEW.quantity,
        'status',     NEW.status,
        'requester',  NEW.requested_by,
        'approver',   NEW.approver_id,
        'event',      TG_OP
    );
    PERFORM pg_notify('user_notification', payload::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_indent ON scms.indent_master;
CREATE TRIGGER trg_notify_indent
    AFTER INSERT OR UPDATE ON scms.indent_master
    FOR EACH ROW EXECUTE FUNCTION scms.notify_indent();

CREATE TABLE IF NOT EXISTS scms.indent_items
(
    item_id     SERIAL PRIMARY KEY,
    indent_id   INTEGER NOT NULL REFERENCES scms.indent_master(indent_id) ON DELETE CASCADE,
    material_id INTEGER,
    item_name   VARCHAR(300) NOT NULL,
    quantity    INTEGER NOT NULL,
    uom         VARCHAR(50),
    unit_price  NUMERIC(12,2) DEFAULT 0,
    total_price NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE INDEX IF NOT EXISTS idx_indent_status    ON scms.indent_master(status);
CREATE INDEX IF NOT EXISTS idx_indent_requester ON scms.indent_master(requested_by);
CREATE INDEX IF NOT EXISTS idx_indent_approver  ON scms.indent_master(approver_id);
CREATE INDEX IF NOT EXISTS idx_indent_created   ON scms.indent_master(created_on DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 2 — NIC portal extension tables
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Users (auth — signup/signin) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    user_id    SERIAL PRIMARY KEY,
    username   VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    name       VARCHAR(200) NOT NULL,
    department VARCHAR(200),
    role       VARCHAR(20)  NOT NULL DEFAULT 'user',
    emp_id     VARCHAR(50),
    status     VARCHAR(20)  NOT NULL DEFAULT 'Active',
    created_on TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Notifications (richer than reference: adds title, type, bookmarks, replies)
CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    title           VARCHAR(300) NOT NULL DEFAULT 'Notification',
    message         TEXT NOT NULL,
    type            VARCHAR(20)  NOT NULL DEFAULT 'info',
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    bookmarked_by   INTEGER[] DEFAULT '{}',
    replies         JSONB DEFAULT '[]',
    created_on      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Employees ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scms.employees (
    id         SERIAL PRIMARY KEY,
    emp_id     VARCHAR(50) UNIQUE NOT NULL,
    name       VARCHAR(200) NOT NULL,
    department VARCHAR(200),
    email      VARCHAR(200),
    phone      VARCHAR(30),
    status     VARCHAR(20) DEFAULT 'Active',
    joined_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO scms.employees (emp_id, name, department, email, phone, status)
VALUES ('EMP-0001','Rajesh Kumar','Warehouse','rajesh@scms.in','9876543210','Active')
ON CONFLICT (emp_id) DO NOTHING;

-- ── Materials ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scms.materials (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(300) NOT NULL,
    category    VARCHAR(100),
    quantity    INTEGER NOT NULL DEFAULT 0,
    unit        VARCHAR(50) DEFAULT 'pcs',
    price       NUMERIC(12,2) DEFAULT 0,
    description TEXT,
    added_by    VARCHAR(200) DEFAULT 'Admin',
    added_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO scms.materials (name, category, quantity, unit, price, description)
VALUES
    ('Bolt M8',          'Hardware', 50, 'pcs',   5.00,  'Standard M8 bolts'),
    ('Lubricant LB-220', 'Chemical', 20, 'liters',150.00,'Industrial lubricant batch LB-220')
ON CONFLICT DO NOTHING;

-- ── Stores ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scms.stores (
    id       SERIAL PRIMARY KEY,
    store_id VARCHAR(50) UNIQUE NOT NULL,
    name     VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    manager  VARCHAR(200),
    capacity INTEGER DEFAULT 0,
    status   VARCHAR(20) DEFAULT 'Active'
);

INSERT INTO scms.stores (store_id, name, location, manager, capacity, status)
VALUES
    ('STR-001','Store Alpha','Building A','Rajesh Kumar',1000,'Active'),
    ('STR-002','Store Beta', 'Building B','N/A',         800, 'Active')
ON CONFLICT (store_id) DO NOTHING;

-- ── Suppliers ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scms.suppliers (
    id          SERIAL PRIMARY KEY,
    supplier_id VARCHAR(50) UNIQUE NOT NULL,
    name        VARCHAR(300) NOT NULL,
    contact     VARCHAR(200),
    phone       VARCHAR(30),
    email       VARCHAR(200),
    materials   TEXT,
    status      VARCHAR(20) DEFAULT 'Active'
);

INSERT INTO scms.suppliers (supplier_id, name, contact, phone, email, materials, status)
VALUES ('SUP-001','RailParts India Ltd','Mr. Sharma','9988776655',
        'info@railparts.in','Bolts, Nuts, Fasteners','Active')
ON CONFLICT (supplier_id) DO NOTHING;

-- ── Inventory ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scms.inventory (
    id        SERIAL PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name      VARCHAR(300) NOT NULL,
    category  VARCHAR(100),
    quantity  INTEGER DEFAULT 0,
    min_qty   INTEGER DEFAULT 0,
    unit      VARCHAR(50) DEFAULT 'pcs',
    location  VARCHAR(200),
    supplier  VARCHAR(300)
);

INSERT INTO scms.inventory (item_code, name, category, quantity, min_qty, unit, location, supplier)
VALUES
    ('INV-001','Bolt M8',          'Hardware',50,100,'pcs',   'Store Alpha','RailParts India Ltd'),
    ('INV-002','Lubricant LB-220', 'Chemical',20, 30,'liters','Store Beta', 'ChemSupply Co.')
ON CONFLICT (item_code) DO NOTHING;

-- ── Manufacture Orders ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scms.manufacture (
    id         SERIAL PRIMARY KEY,
    order_id   VARCHAR(50) UNIQUE NOT NULL,
    product    VARCHAR(300) NOT NULL,
    quantity   INTEGER DEFAULT 0,
    status     VARCHAR(30) DEFAULT 'Planned',
    materials  JSONB DEFAULT '[]',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date   TIMESTAMP WITH TIME ZONE
);

INSERT INTO scms.manufacture (order_id, product, quantity, status, materials)
VALUES ('MFG-001','Rail Bracket Assembly',50,'In Progress',
        '["Bolt M8 x 200","Lubricant LB-220 x 2L"]'::jsonb)
ON CONFLICT (order_id) DO NOTHING;

-- ── Chat Messages ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id            SERIAL PRIMARY KEY,
    from_user     VARCHAR(100) NOT NULL,
    to_user       VARCHAR(100) NOT NULL,
    message       TEXT NOT NULL,
    read_by_admin BOOLEAN DEFAULT FALSE,
    read_by_user  BOOLEAN DEFAULT FALSE,
    created_on    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Purchase Requests ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id            SERIAL PRIMARY KEY,
    user_id       VARCHAR(100) NOT NULL,
    user_name     VARCHAR(200),
    material_id   INTEGER NOT NULL REFERENCES scms.materials(id) ON DELETE CASCADE,
    material_name VARCHAR(300),
    quantity      INTEGER NOT NULL,
    status        VARCHAR(20) DEFAULT 'Pending',
    resolved_at   TIMESTAMP WITH TIME ZONE,
    created_on    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Additional indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notif_user    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read    ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_from     ON public.chat_messages(from_user);
CREATE INDEX IF NOT EXISTS idx_chat_to       ON public.chat_messages(to_user);
CREATE INDEX IF NOT EXISTS idx_purchase_user ON public.purchase_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_stat ON public.purchase_requests(status);
