
CREATE SCHEMA IF NOT EXISTS scms AUTHORIZATION postgres;


CREATE TABLE IF NOT EXISTS scms.indent_master
(
    indent_id        SERIAL PRIMARY KEY,
    indent_no        VARCHAR(50) UNIQUE NOT NULL,
    item_name        VARCHAR(300) NOT NULL,
    quantity         INTEGER NOT NULL,
    uom              VARCHAR(50),
    requested_by     INTEGER NOT NULL,         
    requested_by_name VARCHAR(200),
    approver_id      INTEGER,                  
    store_id         INTEGER,
    dept_code        INTEGER,
    dist_code        INTEGER,
    purpose          TEXT,
    status           VARCHAR(20) DEFAULT 'PENDING', 
    remarks          TEXT,
    approved_by      INTEGER,
    approved_by_name VARCHAR(200),
    approved_on      TIMESTAMP WITH TIME ZONE,
    created_on       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_on       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE OR REPLACE FUNCTION scms.notify_indent()
RETURNS trigger AS $$
DECLARE
    payload JSON;
BEGIN
    payload = json_build_object(
        'indent_id',   NEW.indent_id,
        'indent_no',   NEW.indent_no,
        'item_name',   NEW.item_name,
        'quantity',    NEW.quantity,
        'status',      NEW.status,
        'requester',   NEW.requested_by,
        'approver',    NEW.approver_id,
        'event',       TG_OP
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
    item_id      SERIAL PRIMARY KEY,
    indent_id    INTEGER NOT NULL REFERENCES scms.indent_master(indent_id) ON DELETE CASCADE,
    material_id  INTEGER,
    item_name    VARCHAR(300) NOT NULL,
    quantity     INTEGER NOT NULL,
    uom          VARCHAR(50),
    unit_price   NUMERIC(12,2) DEFAULT 0,
    total_price  NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);


CREATE INDEX IF NOT EXISTS idx_indent_status      ON scms.indent_master(status);
CREATE INDEX IF NOT EXISTS idx_indent_requester   ON scms.indent_master(requested_by);
CREATE INDEX IF NOT EXISTS idx_indent_approver    ON scms.indent_master(approver_id);
CREATE INDEX IF NOT EXISTS idx_indent_created     ON scms.indent_master(created_on DESC);