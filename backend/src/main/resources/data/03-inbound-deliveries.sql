INSERT INTO inbound_delivery (delivery_number, supplier_name, status, delivery_date, note, created_at, updated_at) VALUES
    ('WE-0001', 'Schmidt Befestigungstechnik KG', 'DRAFT', CURRENT_DATE, 'Nachbestellung Kleinteile', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inbound_delivery_item (inbound_delivery_id, product_id, quantity) VALUES
                                                                                  ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-0001'), (SELECT id FROM product WHERE sku = 'ART-0002'), 50),
                                                                                  ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-0001'), (SELECT id FROM product WHERE sku = 'ART-0004'), 20);