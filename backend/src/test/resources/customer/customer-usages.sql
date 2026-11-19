-- Test data for CustomerRepositoryTest.
-- Kunde Alpha: 2 Warenausgänge (DRAFT, CANCELLED)
-- Kunde Beta:  1 Warenausgang (CONFIRMED)
-- Kunde Gamma: no documents
INSERT INTO customer (name, email, city, created_at, updated_at) VALUES
                                                                     ('Kunde Gamma', 'gamma@example.com',      'Berlin',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                                                                     ('Kunde Alpha', 'alpha@mueller-bau.test', 'Hamburg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                                                                     ('Kunde Beta',  NULL,                     'München', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO outbound_order (order_number, customer_id, status, order_date, created_at, updated_at) VALUES
                                                                                                       ('WA-TEST-1', (SELECT id FROM customer WHERE name = 'Kunde Alpha'), 'DRAFT',     CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                                                                                                       ('WA-TEST-2', (SELECT id FROM customer WHERE name = 'Kunde Alpha'), 'CANCELLED', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                                                                                                       ('WA-TEST-3', (SELECT id FROM customer WHERE name = 'Kunde Beta'),  'CONFIRMED', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);