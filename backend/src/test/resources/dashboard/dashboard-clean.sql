-- Empties all business tables (children first). Runs inside the test transaction, so it is rolled back afterwards.
DELETE FROM outbound_order_item;
DELETE FROM outbound_order;
DELETE FROM inbound_delivery_item;
DELETE FROM inbound_delivery;
DELETE FROM customer;
DELETE FROM product;