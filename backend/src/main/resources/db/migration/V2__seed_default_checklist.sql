-- Default Vehicle Inspection Checklist Items
-- Flyway Migration V2

INSERT INTO checklist_items (item_name, category, is_default, is_active) VALUES
('Interior condition', 'INTERIOR', true, true),
('Cleanliness', 'INTERIOR', true, true),
('Exterior condition', 'EXTERIOR', true, true),
('Existing scratches', 'EXTERIOR', true, true),
('New scratches', 'EXTERIOR', true, true),
('Damages', 'EXTERIOR', true, true),
('Tyre condition', 'MECHANICAL', true, true),
('Warning lights', 'MECHANICAL', true, true),
('Fuel level', 'MECHANICAL', true, true),
('Charging cable', 'ACCESSORIES', true, true),
('Neck pillow', 'ACCESSORIES', true, true),
('Other accessories', 'ACCESSORIES', true, true);
