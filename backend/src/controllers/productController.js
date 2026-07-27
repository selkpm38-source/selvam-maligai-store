'use strict';

const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');

const CATEGORY_NAMES = {
  c1: 'Rice & Grains',
  c2: 'Dals & Pulses',
  c3: 'Spices & Masalas',
  c4: 'Oils & Ghee',
  c5: 'Snacks',
  c6: 'Dairy',
  c7: 'Vegetables',
  c8: 'Beverages',
};

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category_slug || row.category_id,
    image: row.image || '🍚',
    mrp: Number(row.mrp),
    sellingPrice: Number(row.selling_price),
    discountPercentage: Number(row.discount_percentage),
    unit: row.unit,
    stockStatus: row.stock_status,
    rating: Number(row.avg_rating),
    ratingCount: row.rating_count,
    isFeatured: Boolean(row.is_featured),
    isTrending: Boolean(row.is_trending),
    isBestseller: Boolean(row.is_bestseller),
    isNewArrival: Boolean(row.is_new_arrival),
  };
}

async function resolveCategory(category) {
  const name = CATEGORY_NAMES[category] || category || 'General';
  const slug = slugify(name);

  const existing = await db.query(
    'SELECT id FROM categories WHERE slug = $1 LIMIT 1',
    [slug]
  );

  if (existing[0]) return existing[0].id;

  const id = uuidv4();

  await db.query(
    `INSERT INTO categories
     (id, name, slug, is_active, display_order)
     VALUES ($1, $2, $3, TRUE, 0)`,
    [id, name, slug]
  );

  return id;
}

function productValues(body) {
  const mrp = Number(body.mrp);
  const sellingPrice = Number(body.sellingPrice);

  if (
    !body.name ||
    !body.unit ||
    !Number.isFinite(mrp) ||
    !Number.isFinite(sellingPrice)
  ) {
    throw new AppError(
      'Name, unit, MRP, and selling price are required.',
      422
    );
  }

  const discountPercentage =
    body.discountPercentage == null
      ? Math.max(
          0,
          Math.round(((mrp - sellingPrice) / mrp) * 100)
        )
      : Number(body.discountPercentage);

  return {
    mrp,
    sellingPrice,
    discountPercentage,
  };
}

async function list(req, res, next) {
  try {
    const rows = await db.query(
      `SELECT p.*, c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.status = 'active'
       ORDER BY p.created_at DESC`
    );

    res.json({
      success: true,
      data: rows.map(toProduct),
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const {
      mrp,
      sellingPrice,
      discountPercentage,
    } = productValues(req.body);

    const id = uuidv4();
    const slug = `${slugify(req.body.name)}-${id.slice(0, 8)}`;
    const categoryId = await resolveCategory(req.body.category);

    await db.query(
      `INSERT INTO products
       (
         id,
         category_id,
         name,
         slug,
         sku,
         unit,
         mrp,
         selling_price,
         discount_percentage,
         stock_status,
         status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')`,
      [
        id,
        categoryId,
        req.body.name.trim(),
        slug,
        `SKU-${id.slice(0, 8).toUpperCase()}`,
        req.body.unit,
        mrp,
        sellingPrice,
        discountPercentage,
        req.body.stockStatus || 'in_stock',
      ]
    );

    const rows = await db.query(
      `SELECT p.*, c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [id]
    );

    res.status(201).json({
      success: true,
      data: toProduct(rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const {
      mrp,
      sellingPrice,
      discountPercentage,
    } = productValues(req.body);

    const categoryId = await resolveCategory(req.body.category);

    const result = await db.query(
      `UPDATE products
       SET
         category_id = $1,
         name = $2,
         unit = $3,
         mrp = $4,
         selling_price = $5,
         discount_percentage = $6,
         stock_status = $7
       WHERE id = $8`,
      [
        categoryId,
        req.body.name.trim(),
        req.body.unit,
        mrp,
        sellingPrice,
        discountPercentage,
        req.body.stockStatus || 'in_stock',
        req.params.id,
      ]
    );

    if (!result || result.rowCount === 0) {
      throw new AppError('Product not found.', 404);
    }

    const rows = await db.query(
      `SELECT p.*, c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: toProduct(rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await db.query(
      `UPDATE products
       SET status = 'inactive'
       WHERE id = $1`,
      [req.params.id]
    );

    if (!result || result.rowCount === 0) {
      throw new AppError('Product not found.', 404);
    }

    res.json({
      success: true,
      message: 'Product deleted.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  create,
  update,
  remove,
};