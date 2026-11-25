-- Demo Wareneingänge in every status. Rows are inserted in chronological order, so the identity id matches the
-- number suffix (WE-<year>-<id 4 digits>, rule 9) and documents created in the app continue the sequence.
-- Dates are relative to the start date, so the demo always looks current.
INSERT INTO inbound_delivery (delivery_number, supplier_name, status, delivery_date, note, created_at, updated_at) VALUES
    ('WE-2026-0001', 'Schmidt Befestigungstechnik KG', 'CONFIRMED', CAST(CURRENT_TIMESTAMP - INTERVAL '20' DAY AS DATE), 'Erstausstattung Kleinteile',        CURRENT_TIMESTAMP - INTERVAL '20' DAY, CURRENT_TIMESTAMP - INTERVAL '20' DAY),
    ('WE-2026-0002', 'ArbeitsSchutz Profi GmbH',       'CONFIRMED', CAST(CURRENT_TIMESTAMP - INTERVAL '19' DAY AS DATE), NULL,                                CURRENT_TIMESTAMP - INTERVAL '19' DAY, CURRENT_TIMESTAMP - INTERVAL '19' DAY),
    ('WE-2026-0003', 'Verpackung Nord GmbH',           'CONFIRMED', CAST(CURRENT_TIMESTAMP - INTERVAL '18' DAY AS DATE), 'Rahmenvertrag Q4',                  CURRENT_TIMESTAMP - INTERVAL '18' DAY, CURRENT_TIMESTAMP - INTERVAL '18' DAY),
    ('WE-2026-0004', 'Verpackung Nord GmbH',           'CANCELLED', CAST(CURRENT_TIMESTAMP - INTERVAL '12' DAY AS DATE), 'Falsche Ware geliefert, retour',    CURRENT_TIMESTAMP - INTERVAL '12' DAY, CURRENT_TIMESTAMP - INTERVAL '11' DAY),
    ('WE-2026-0005', 'Schmidt Befestigungstechnik KG', 'CONFIRMED', CAST(CURRENT_TIMESTAMP - INTERVAL '6' DAY AS DATE),  NULL,                                CURRENT_TIMESTAMP - INTERVAL '6' DAY,  CURRENT_TIMESTAMP - INTERVAL '6' DAY),
    ('WE-2026-0006', 'Schmidt Befestigungstechnik KG', 'DRAFT',     CAST(CURRENT_TIMESTAMP + INTERVAL '2' DAY AS DATE),  'Nachbestellung Kleinteile',         CURRENT_TIMESTAMP - INTERVAL '1' DAY,  CURRENT_TIMESTAMP - INTERVAL '1' DAY),
    ('WE-2026-0007', 'Verpackung Nord GmbH',           'DRAFT',     CAST(CURRENT_TIMESTAMP + INTERVAL '3' DAY AS DATE),  'Nachbestellung Versandkartons',     CURRENT_TIMESTAMP,                     CURRENT_TIMESTAMP);

INSERT INTO inbound_delivery_item (inbound_delivery_id, product_id, quantity) VALUES
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0001'), (SELECT id FROM product WHERE sku = 'ART-0001'), 150),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0001'), (SELECT id FROM product WHERE sku = 'ART-0002'), 100),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0001'), (SELECT id FROM product WHERE sku = 'ART-0004'),  30),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0002'), (SELECT id FROM product WHERE sku = 'ART-0005'),  60),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0002'), (SELECT id FROM product WHERE sku = 'ART-0008'),  10),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0003'), (SELECT id FROM product WHERE sku = 'ART-0003'),  25),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0003'), (SELECT id FROM product WHERE sku = 'ART-0006'), 200),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0003'), (SELECT id FROM product WHERE sku = 'ART-0007'),  40),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0004'), (SELECT id FROM product WHERE sku = 'ART-0003'),  10),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0004'), (SELECT id FROM product WHERE sku = 'ART-0006'), 100),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0005'), (SELECT id FROM product WHERE sku = 'ART-0001'),  20),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0006'), (SELECT id FROM product WHERE sku = 'ART-0002'),  50),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0006'), (SELECT id FROM product WHERE sku = 'ART-0004'),  20),
    ((SELECT id FROM inbound_delivery WHERE delivery_number = 'WE-2026-0007'), (SELECT id FROM product WHERE sku = 'ART-0006'), 150);
