-- Seed-like data for DashboardServiceTest. Expected values:
--   productCount 15, customerCount 3
--   lowStockCount 12 (quantity <= min_quantity, incl. out of stock and the EDGE product), outOfStockCount 1
--   lowStockProducts: LOW-00 .. LOW-09 (10 items, lowest quantity first)
--   openInboundDrafts 2, openOutboundDrafts 3
--   recentInbound:  WE-T-301, WE-T-307, WE-T-306, WE-T-305, WE-T-304 (by created_at, NOT by id)
--   recentOutbound: WA-T-406, WA-T-405, WA-T-404, WA-T-403, WA-T-402

-- Products: ids deliberately shuffled against quantity, so sorting must come from the query
INSERT INTO product (id, sku, name, unit, quantity, min_quantity, version, created_at, updated_at) VALUES
                                                                                                       (101, 'LOW-07', 'Schrauben M4',        'PIECE',   7, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (102, 'LOW-02', 'Kabelbinder 200 mm',  'PIECE',   2, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (103, 'LOW-10', 'Dübel 6 mm',          'PIECE',  10, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (104, 'LOW-00', 'Klebeband transparent','PIECE',  0, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (105, 'LOW-05', 'Arbeitshandschuhe',   'PIECE',   5, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (106, 'LOW-09', 'Versandkarton S',     'PIECE',   9, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (107, 'LOW-01', 'Luftpolsterfolie',    'PIECE',   1, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (108, 'LOW-04', 'Etiketten A4',        'BOX',     4, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (109, 'LOW-08', 'Versandkarton M',     'PIECE',   8, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (110, 'LOW-03', 'Kugelschreiber blau', 'PIECE',   3, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (111, 'LOW-06', 'Paketschnur',         'PIECE',   6, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (112, 'EDGE-20','Palettenfolie',       'PIECE',  20, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'), -- exactly at minimum -> low
                                                                                                       (113, 'OK-21',  'Versandkarton L',     'PIECE',  21, 20, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'), -- one above -> ok
                                                                                                       (114, 'OK-100', 'Holzpalette',         'PIECE', 100,  0, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                       (115, 'OK-5',   'Hubwagen',            'PIECE',   5,  0, 0, '2026-11-01 08:00:00', '2026-11-01 08:00:00');

INSERT INTO customer (id, name, email, phone, street, zip_code, city, created_at, updated_at) VALUES
                                                                                                  (201, 'Müller GmbH',      'info@mueller.example',  '030 123456', 'Hauptstraße 1',  '10115', 'Berlin',  '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                  (202, 'Schmidt & Söhne',  'kontakt@schmidt.example','089 654321', 'Bahnhofstraße 5','80335', 'München', '2026-11-01 08:00:00', '2026-11-01 08:00:00'),
                                                                                                  (203, 'Weber Logistik KG','service@weber.example', '040 112233', 'Hafenweg 12',    '20457', 'Hamburg', '2026-11-01 08:00:00', '2026-11-01 08:00:00');

-- Inbound: id 301 is the NEWEST on purpose (id order != creation order)
INSERT INTO inbound_delivery (id, delivery_number, supplier_name, status, delivery_date, note, created_at, updated_at) VALUES
                                                                                                                           (301, 'WE-T-301', 'Würth',       'CONFIRMED', '2026-11-09', NULL, '2026-11-09 10:00:00', '2026-11-09 10:00:00'),
                                                                                                                           (302, 'WE-T-302', 'Hornbach',    'CONFIRMED', '2026-11-02', NULL, '2026-11-02 10:00:00', '2026-11-02 10:00:00'),
                                                                                                                           (303, 'WE-T-303', 'Würth',       'CANCELLED', '2026-11-03', NULL, '2026-11-03 10:00:00', '2026-11-03 10:00:00'),
                                                                                                                           (304, 'WE-T-304', 'Bauhaus',     'CONFIRMED', '2026-11-04', NULL, '2026-11-04 10:00:00', '2026-11-04 10:00:00'),
                                                                                                                           (305, 'WE-T-305', 'Hornbach',    'DRAFT',     '2026-11-05', NULL, '2026-11-05 10:00:00', '2026-11-05 10:00:00'),
                                                                                                                           (306, 'WE-T-306', 'Bauhaus',     'CONFIRMED', '2026-11-06', NULL, '2026-11-06 10:00:00', '2026-11-06 10:00:00'),
                                                                                                                           (307, 'WE-T-307', 'Würth',       'DRAFT',     '2026-11-07', NULL, '2026-11-07 10:00:00', '2026-11-07 10:00:00');

INSERT INTO outbound_order (id, order_number, customer_id, status, order_date, note, created_at, updated_at) VALUES
                                                                                                                 (401, 'WA-T-401', 201, 'CONFIRMED', '2026-11-10', NULL, '2026-11-10 10:00:00', '2026-11-10 10:00:00'),
                                                                                                                 (402, 'WA-T-402', 202, 'DRAFT',     '2026-11-11', NULL, '2026-11-11 10:00:00', '2026-11-11 10:00:00'),
                                                                                                                 (403, 'WA-T-403', 203, 'CANCELLED', '2026-11-12', NULL, '2026-11-12 10:00:00', '2026-11-12 10:00:00'),
                                                                                                                 (404, 'WA-T-404', 201, 'DRAFT',     '2026-11-13', NULL, '2026-11-13 10:00:00', '2026-11-13 10:00:00'),
                                                                                                                 (405, 'WA-T-405', 202, 'CONFIRMED', '2026-11-14', NULL, '2026-11-14 10:00:00', '2026-11-14 10:00:00'),
                                                                                                                 (406, 'WA-T-406', 203, 'DRAFT',     '2026-11-15', NULL, '2026-11-15 10:00:00', '2026-11-15 10:00:00');