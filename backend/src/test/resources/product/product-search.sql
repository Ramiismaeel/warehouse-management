-- Test data for ProductRepositoryTest: search in SKU and name, including LIKE wildcard characters.
INSERT INTO product (sku, name, unit, quantity, min_quantity, version, created_at, updated_at) VALUES
    ('S-200', 'Schraube M4', 'PIECE', 10, 5, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('S-100', 'Mutter m4', 'PIECE', 10, 5, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('S-300', '100% Edelstahl', 'PIECE', 10, 5, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('S-400', 'Kabel_Binder', 'PIECE', 10, 5, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('S-500', 'Ordner A\B', 'PIECE', 10, 5, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
