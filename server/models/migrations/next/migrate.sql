DROP TABLE department;

DELETE FROM role_unit WHERE unit_id = 215;
DELETE FROM unit WHERE id = 215;

ALTER TABLE inventory_log DROP FOREIGN KEY `inventory_log_ibfk_1`;
