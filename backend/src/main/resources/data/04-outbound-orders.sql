INSERT INTO outbound_order (order_number, customer_id, status, order_date, note, created_at, updated_at) VALUES
    ('WA-0001', (SELECT id FROM customer WHERE email = 'einkauf@mueller-bau.example'), 'DRAFT', CURRENT_DATE, 'Baustelle Nord', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO outbound_order_item (outbound_order_id, product_id, quantity) VALUES
                                                                              ((SELECT id FROM outbound_order WHERE order_number = 'WA-0001'), (SELECT id FROM product WHERE sku = 'ART-0001'), 30),
                                                                              ((SELECT id FROM outbound_order WHERE order_number = 'WA-0001'), (SELECT id FROM product WHERE sku = 'ART-0005'), 10);