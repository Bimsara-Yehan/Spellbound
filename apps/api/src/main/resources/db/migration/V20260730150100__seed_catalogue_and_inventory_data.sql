-- V20260730150100__seed_catalogue_and_inventory_data.sql
-- Seed Data: Sample Categories, Products, Variants, and Initial Stock

-- Insert Categories
INSERT INTO category (id, slug, name, description)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'tea-spices', 'Ceylon Tea & Spices', 'Authentic premium Ceylon tea blends and organic Sri Lankan spices'),
    ('22222222-2222-2222-2222-222222222222', 'apparel', 'Apparel & Fashion', 'Handcrafted batik shirts, traditional sarongs, and modern casualwear'),
    ('33333333-3333-3333-3333-333333333333', 'electronics', 'Electronics & Accessories', 'Mobile accessories, audio devices, and computer peripherals');

-- Insert Products
INSERT INTO product (id, slug, name, description, category_id, status, attributes, pos_external_id, sync_status)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ceylon-silver-tips-tea-100g', 'Ceylon Silver Tips Premium Tea (100g)', 'Rare white tea harvested by hand in Nuwara Eliya', '11111111-1111-1111-1111-111111111111', 'ACTIVE', '{"weight":"100g","origin":"Nuwara Eliya"}', 'POS-TEA-001', 'SYNCED'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'handloom-batik-shirt', 'Handloom Cotton Batik Shirt', '100% pure cotton handcrafted traditional batik shirt', '22222222-2222-2222-2222-222222222222', 'ACTIVE', '{"material":"Cotton","origin":"Kandy"}', 'POS-APP-002', 'SYNCED'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'wireless-ergonomic-mouse', 'Wireless Ergonomic Mouse', '2.4GHz rechargeable wireless ergonomic optical mouse', '33333333-3333-3333-3333-333333333333', 'ACTIVE', '{"connectivity":"Wireless","color":"Black"}', 'POS-ELE-003', 'SYNCED');

-- Insert Product Variants
INSERT INTO product_variant (id, product_id, sku, option_values, price_cents, compare_at_cents, pos_external_id)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TEA-SILVER-100G', '{"size":"100g"}', 250000, 280000, 'POS-VAR-TEA-01'),
    ('20000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'SHIRT-BATIK-M', '{"size":"M","colour":"Ocean Blue"}', 450000, NULL, 'POS-VAR-APP-01'),
    ('20000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'SHIRT-BATIK-L', '{"size":"L","colour":"Ocean Blue"}', 450000, NULL, 'POS-VAR-APP-02'),
    ('30000000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ELEC-MOUSE-W01', '{"colour":"Matte Black"}', 320000, 350000, 'POS-VAR-ELE-01');

-- Insert Initial Inventory Records
INSERT INTO inventory (variant_id, quantity_on_hand, quantity_reserved, safety_buffer)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 150, 5, 10),
    ('20000000-0000-0000-0000-000000000001', 35, 2, 5),
    ('20000000-0000-0000-0000-000000000002', 20, 0, 5),
    ('30000000-0000-0000-0000-000000000001', 8, 1, 10); -- Low stock trigger: 8 - 1 - 10 = -3 <= 10 safety buffer

-- Insert Stock Adjustment Audits
INSERT INTO stock_adjustment_audit (variant_id, actor, quantity_delta, previous_quantity, new_quantity, reason)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'system_initializer', 150, 0, 150, 'Initial POS baseline sync'),
    ('20000000-0000-0000-0000-000000000001', 'system_initializer', 35, 0, 35, 'Initial POS baseline sync'),
    ('20000000-0000-0000-0000-000000000002', 'system_initializer', 20, 0, 20, 'Initial POS baseline sync'),
    ('30000000-0000-0000-0000-000000000001', 'system_initializer', 8, 0, 8, 'Initial POS baseline sync');
