-- Demo Warenausgänge in every status. Rows are inserted in chronological order, so the identity id matches the
-- number suffix (WA-<year>-<id 4 digits>, rule 9) and documents created in the app continue the sequence.
-- WA-2026-0008 asks for out-of-stock Versandkartons: confirming it shows the 409 shortage message in the demo.
-- Customers are looked up by name (Becker Gartenbau has no email). Schulz Haustechnik is left unused on purpose,
-- so it can be deleted in the demo.
INSERT INTO outbound_order (order_number, customer_id, status, order_date, note, created_at, updated_at) VALUES
    ('WA-2026-0001', (SELECT id FROM customer WHERE name = 'Müller Bau GmbH'),        'CONFIRMED', CAST(CURRENT_TIMESTAMP - INTERVAL '17' DAY AS DATE), 'Baustelle Nord',               CURRENT_TIMESTAMP - INTERVAL '17' DAY, CURRENT_TIMESTAMP - INTERVAL '17' DAY),
    ('WA-2026-0002', (SELECT id FROM customer WHERE name = 'Schneider Logistik'),     'CONFIRMED', CAST(CURRENT_TIMESTAMP - INTERVAL '14' DAY AS DATE), NULL,                           CURRENT_TIMESTAMP - INTERVAL '14' DAY, CURRENT_TIMESTAMP - INTERVAL '14' DAY),
    ('WA-2026-0003', (SELECT id FROM customer WHERE name = 'Bäckerei Weber'),         'CANCELLED', CAST(CURRENT_TIMESTAMP - INTERVAL '13' DAY AS DATE), 'Kunde hat Auftrag storniert',  CURRENT_TIMESTAMP - INTERVAL '13' DAY, CURRENT_TIMESTAMP - INTERVAL '12' DAY),
    ('WA-2026-0004', (SELECT id FROM customer WHERE name = 'Fischer Elektrotechnik'), 'CONFIRMED', CAST(CURRENT_TIMESTAMP - INTERVAL '10' DAY AS DATE), NULL,                           CURRENT_TIMESTAMP - INTERVAL '10' DAY, CURRENT_TIMESTAMP - INTERVAL '10' DAY),
    ('WA-2026-0005', (SELECT id FROM customer WHERE name = 'Hoffmann Handel KG'),     'CONFIRMED', CAST(CURRENT_TIMESTAMP - INTERVAL '7' DAY AS DATE),  'Expresslieferung',             CURRENT_TIMESTAMP - INTERVAL '7' DAY,  CURRENT_TIMESTAMP - INTERVAL '7' DAY),
    ('WA-2026-0006', (SELECT id FROM customer WHERE name = 'Wagner Metallbau'),       'CONFIRMED', CAST(CURRENT_TIMESTAMP - INTERVAL '4' DAY AS DATE),  NULL,                           CURRENT_TIMESTAMP - INTERVAL '4' DAY,  CURRENT_TIMESTAMP - INTERVAL '4' DAY),
    ('WA-2026-0007', (SELECT id FROM customer WHERE name = 'Müller Bau GmbH'),        'DRAFT',     CAST(CURRENT_TIMESTAMP - INTERVAL '1' DAY AS DATE),  'Baustelle Süd',                CURRENT_TIMESTAMP - INTERVAL '1' DAY,  CURRENT_TIMESTAMP - INTERVAL '1' DAY),
    ('WA-2026-0008', (SELECT id FROM customer WHERE name = 'Becker Gartenbau'),       'DRAFT',     CAST(CURRENT_TIMESTAMP AS DATE),                     NULL,                           CURRENT_TIMESTAMP,                     CURRENT_TIMESTAMP);

INSERT INTO outbound_order_item (outbound_order_id, product_id, quantity) VALUES
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0001'), (SELECT id FROM product WHERE sku = 'ART-0001'),  30),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0001'), (SELECT id FROM product WHERE sku = 'ART-0004'),  12),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0001'), (SELECT id FROM product WHERE sku = 'ART-0005'),  10),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0002'), (SELECT id FROM product WHERE sku = 'ART-0003'),   6),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0002'), (SELECT id FROM product WHERE sku = 'ART-0006'), 120),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0002'), (SELECT id FROM product WHERE sku = 'ART-0007'),  16),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0003'), (SELECT id FROM product WHERE sku = 'ART-0004'),   5),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0003'), (SELECT id FROM product WHERE sku = 'ART-0006'),  30),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0004'), (SELECT id FROM product WHERE sku = 'ART-0002'),  60),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0004'), (SELECT id FROM product WHERE sku = 'ART-0008'),   6),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0005'), (SELECT id FROM product WHERE sku = 'ART-0002'),  32),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0005'), (SELECT id FROM product WHERE sku = 'ART-0003'),   4),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0005'), (SELECT id FROM product WHERE sku = 'ART-0006'),  80),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0006'), (SELECT id FROM product WHERE sku = 'ART-0001'),  20),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0006'), (SELECT id FROM product WHERE sku = 'ART-0004'),  15),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0006'), (SELECT id FROM product WHERE sku = 'ART-0005'),  10),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0007'), (SELECT id FROM product WHERE sku = 'ART-0001'),  30),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0007'), (SELECT id FROM product WHERE sku = 'ART-0005'),  10),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0008'), (SELECT id FROM product WHERE sku = 'ART-0006'),  40),
    ((SELECT id FROM outbound_order WHERE order_number = 'WA-2026-0008'), (SELECT id FROM product WHERE sku = 'ART-0007'),   5);
