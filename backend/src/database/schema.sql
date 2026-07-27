-- =========================================================
-- SELVAM MALIGAI STORE — Full E-Commerce Schema (MySQL 8+)
-- Phase 1 deliverable. Uses InnoDB, utf8mb4, FK constraints,
-- and indexes on all foreign keys / commonly filtered columns.
-- =========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS selvam_maligai_store
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE selvam_maligai_store;

-- =========================================================
-- USERS & ADMINS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  phone_verified TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  last_login_at DATETIME NULL,
  referral_code VARCHAR(20) UNIQUE,
  referred_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_referred_by FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_phone (phone)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admins (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner','manager','staff') NOT NULL DEFAULT 'staff',
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS addresses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  label VARCHAR(50) DEFAULT 'Home',
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  landmark VARCHAR(255),
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_addresses_user (user_id)
) ENGINE=InnoDB;

-- =========================================================
-- CATALOG: CATEGORIES, BRANDS, PRODUCTS
-- =========================================================

CREATE TABLE IF NOT EXISTS categories (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  parent_id CHAR(36) NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  image_url VARCHAR(500),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_categories_parent (parent_id),
  INDEX idx_categories_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS brands (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(140) NOT NULL UNIQUE,
  logo_url VARCHAR(500),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  category_id CHAR(36) NOT NULL,
  brand_id CHAR(36) NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  description TEXT,
  ingredients TEXT,
  sku VARCHAR(60) NOT NULL UNIQUE,
  barcode VARCHAR(60) UNIQUE,
  unit VARCHAR(30) NOT NULL DEFAULT 'pcs',        -- e.g. kg, g, l, ml, pcs
  weight DECIMAL(10,3) NULL,
  mrp DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  stock_status ENUM('in_stock','low_stock','out_of_stock') NOT NULL DEFAULT 'in_stock',
  manufacturing_date DATE NULL,
  expiry_date DATE NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_trending TINYINT(1) NOT NULL DEFAULT 0,
  is_offer TINYINT(1) NOT NULL DEFAULT 0,
  is_recommended TINYINT(1) NOT NULL DEFAULT 0,
  is_bestseller TINYINT(1) NOT NULL DEFAULT 0,
  is_new_arrival TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('draft','active','inactive') NOT NULL DEFAULT 'active',
  views_count INT NOT NULL DEFAULT 0,
  sold_count INT NOT NULL DEFAULT 0,
  avg_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
  INDEX idx_products_category (category_id),
  INDEX idx_products_brand (brand_id),
  INDEX idx_products_discount (discount_percentage),
  INDEX idx_products_status (status),
  INDEX idx_products_featured (is_featured),
  INDEX idx_products_offer (is_offer),
  FULLTEXT INDEX ft_products_search (name, description)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_images (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_id CHAR(36) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_pimages_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_pimages_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventory_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_id CHAR(36) NOT NULL,
  change_qty INT NOT NULL,
  reason ENUM('restock','sale','return','adjustment','damage') NOT NULL,
  admin_id CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invlog_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_invlog_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_invlog_product (product_id)
) ENGINE=InnoDB;

-- =========================================================
-- CART & WISHLIST
-- =========================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  saved_for_later TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_cart_user_product (user_id, product_id),
  INDEX idx_cart_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wishlist_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recently_viewed (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recview_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_recview_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_recview_user (user_id, viewed_at)
) ENGINE=InnoDB;

-- =========================================================
-- COUPONS & DISCOUNTS
-- =========================================================

CREATE TABLE IF NOT EXISTS coupons (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(40) NOT NULL UNIQUE,
  type ENUM('flat','percentage') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_discount_amount DECIMAL(10,2) NULL,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  per_user_limit INT NOT NULL DEFAULT 1,
  is_gift_coupon TINYINT(1) NOT NULL DEFAULT 0,
  valid_from DATETIME NOT NULL,
  valid_until DATETIME NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS coupon_usages (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  coupon_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  order_id CHAR(36) NULL,
  used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cusage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  CONSTRAINT fk_cusage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_cusage_coupon_user (coupon_id, user_id)
) ENGINE=InnoDB;

-- =========================================================
-- ORDERS
-- =========================================================

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_number VARCHAR(30) NOT NULL UNIQUE,
  user_id CHAR(36) NULL,                 -- nullable: guest checkout
  guest_name VARCHAR(120) NULL,
  guest_phone VARCHAR(20) NULL,
  address_id CHAR(36) NULL,
  shipping_address JSON NOT NULL,        -- snapshot at order time
  delivery_instructions VARCHAR(500),
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  coupon_id CHAR(36) NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cod','upi','card','netbanking') NOT NULL,
  payment_status ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  order_status ENUM('placed','confirmed','packed','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'placed',
  placed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (order_status),
  INDEX idx_orders_number (order_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  product_name_snapshot VARCHAR(200) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_oitems_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_oitems_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_oitems_order (order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_status_history (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,
  status ENUM('placed','confirmed','packed','out_for_delivery','delivered','cancelled') NOT NULL,
  note VARCHAR(255),
  changed_by CHAR(36) NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ostatus_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_ostatus_order (order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,
  method ENUM('cod','upi','card','netbanking') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(120),
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_payments_order (order_id)
) ENGINE=InnoDB;

-- =========================================================
-- REVIEWS & RATINGS
-- =========================================================

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  order_id CHAR(36) NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(150),
  comment TEXT,
  is_verified_purchase TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_review_user_product (user_id, product_id),
  INDEX idx_reviews_product (product_id)
) ENGINE=InnoDB;

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  recipient_type ENUM('customer','admin') NOT NULL,
  recipient_id CHAR(36) NOT NULL,
  type VARCHAR(60) NOT NULL,             -- order_placed, low_stock, new_grievance, etc.
  title VARCHAR(150) NOT NULL,
  message VARCHAR(500) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  metadata JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_recipient (recipient_type, recipient_id, is_read)
) ENGINE=InnoDB;

-- =========================================================
-- GRIEVANCES
-- =========================================================

CREATE TABLE IF NOT EXISTS grievances (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  ticket_number VARCHAR(30) NOT NULL UNIQUE,
  user_id CHAR(36) NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190),
  phone VARCHAR(20),
  type ENUM('complaint','feedback','suggestion','issue','feature_request') NOT NULL,
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  order_id CHAR(36) NULL,
  status ENUM('submitted','in_review','resolved','closed') NOT NULL DEFAULT 'submitted',
  admin_response TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_grievances_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_grievances_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_grievances_status (status)
) ENGINE=InnoDB;

-- =========================================================
-- STORE SETTINGS & BANNERS
-- =========================================================

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS banners (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(150),
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500),
  position ENUM('hero_slider','homepage_offer','category_banner') NOT NULL DEFAULT 'hero_slider',
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- AUDIT LOGS
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_type ENUM('user','admin','system') NOT NULL,
  actor_id CHAR(36) NULL,
  action VARCHAR(100) NOT NULL,          -- login, login_failed, order_placed, product_updated...
  entity_type VARCHAR(60),
  entity_id CHAR(36),
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  details JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_actor (actor_type, actor_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
