-- Demo products. Every quantity equals the sum of the CONFIRMED Wareneingänge minus the CONFIRMED Warenausgänge
-- in 03/04 (CANCELLED documents net to zero, DRAFT documents have no effect).
-- Low stock (quantity <= min_quantity): ART-0002, ART-0004, ART-0008 (exactly at the threshold).
-- Out of stock: ART-0006.
INSERT INTO product (sku, name, description, unit, quantity, min_quantity, image_url, version, created_at, updated_at) VALUES
    ('ART-0001', 'Schrauben M6',               'Edelstahl, 100 Stk. pro Karton', 'BOX',   120, 20, 'https://picsum.photos/seed/ART-0001/400/300', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ART-0002', 'Kabelbinder 200 mm',         'Schwarz, 100 Stk. pro Karton',   'BOX',     8, 25, 'https://picsum.photos/seed/ART-0002/400/300', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ART-0003', 'Palettenfolie',              'Transparent, 500 mm, Rolle',     'PIECE',  15,  5, 'https://picsum.photos/seed/ART-0003/400/300', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ART-0004', 'Packband braun',             '50 mm x 66 m, Rolle',            'PIECE',   3, 10, 'https://picsum.photos/seed/ART-0004/400/300', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ART-0005', 'Arbeitshandschuhe Gr. 9',    'Nitril beschichtet, Paar',       'PIECE',  40, 10, 'https://picsum.photos/seed/ART-0005/400/300', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ART-0006', 'Versandkarton 600x400x400',  'Zweiwellig, braun',              'PIECE',   0, 50, 'https://picsum.photos/seed/ART-0006/400/300', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ART-0007', 'Europalette',                'EPAL, 1200 x 800 mm',            'PIECE',  24, 10, 'https://picsum.photos/seed/ART-0007/400/300', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ART-0008', 'Sicherheitsschuhe Gr. 43',   'S3, Paar',                       'PIECE',   4,  4, 'https://picsum.photos/seed/ART-0008/400/300', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
