-- Test data for ProductRepositoryTest: usage counts across Wareneingänge and Warenausgänge.
-- P-USED-BOTH: 2 Wareneingänge (DRAFT, CONFIRMED) + 1 Warenausgang (CANCELLED)
-- P-USED-OUT:  1 Warenausgang (DRAFT)
-- P-UNUSED:    no documents
INSERT INTO product (sku, name, unit, quantity, min_quantity, version, created_at, updated_at) VALUES
    ('P-USED-BOTH', 'Schraube M4', 'PIECE', 10, 5, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('P-USED-OUT', 'Mutter M4', 'PIECE', 10, 5, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('P-UNUSED', 'Unterlegscheibe M4', 'PIECE', 10, 5, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO customer (name, created_at, updated_at) VALUES
    ('Testkunde', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inbound_delivery (delivery_number, supplier_name, status, delivery_date, created_at, updated_at) VALUES
    ('WE-TEST-1', 'Lieferant A', 'DRAFT', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('WE-TEST-2', 'Lieferant B', 'CONFIRMED', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inbound_delivery_item (inbound_delivery_id, product_id, quantity) VALUES
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-TEST-1'), (SELECT id FROM product WHERE sku = 'P-USED-BOTH'), 5),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-TEST-2'), (SELECT id FROM product WHERE sku = 'P-USED-BOTH'), 7);

INSERT INTO outbound_order (order_number, customer_id, status, order_date, created_at, updated_at) VALUES
    ('WA-TEST-1', (SELECT id FROM customer WHERE name = 'Testkunde'), 'CANCELLED', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('WA-TEST-2', (SELECT id FROM customer WHERE name = 'Testkunde'), 'DRAFT', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO outbound_order_item (outbound_order_id, product_id, quantity) VALUES
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-TEST-1'), (SELECT id FROM product WHERE sku = 'P-USED-BOTH'), 3),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-TEST-2'), (SELECT id FROM product WHERE sku = 'P-USED-OUT'), 1);
