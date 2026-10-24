CREATE DATABASE IF NOT EXISTS hydrohomie CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hydrohomie;

CREATE TABLE IF NOT EXISTS sensors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_code VARCHAR(64) NOT NULL UNIQUE,
  sensor_name VARCHAR(120) NOT NULL,
  location_description VARCHAR(255) NOT NULL,
  warning_threshold_m DECIMAL(6,3) NOT NULL DEFAULT 1.800,
  critical_threshold_m DECIMAL(6,3) NOT NULL DEFAULT 2.500,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS readings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sensor_id BIGINT UNSIGNED NOT NULL,
  water_level_m DECIMAL(7,3) NOT NULL,
  battery_voltage DECIMAL(5,2) NULL,
  signal_strength SMALLINT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_readings_sensor_time (sensor_id, recorded_at),
  CONSTRAINT fk_readings_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alert_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sensor_id BIGINT UNSIGNED NULL,
  severity ENUM('info','warning','critical') NOT NULL,
  title VARCHAR(160) NOT NULL,
  message VARCHAR(500) NOT NULL,
  acknowledged_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_alert_events_time (created_at),
  CONSTRAINT fk_alert_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE SET NULL
);

-- Optional placeholder for a future resident directory.
-- Store only necessary data and obtain consent before sending SMS.
CREATE TABLE IF NOT EXISTS residents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  display_name VARCHAR(120) NOT NULL,
  phone_number VARCHAR(32) NOT NULL,
  zone_label VARCHAR(80) NULL,
  consent_sms TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
