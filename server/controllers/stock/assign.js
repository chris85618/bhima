/**
 * Stock Assign Controller
 */
const db = require('../../lib/db');
const util = require('../../lib/util');
const FilterParser = require('../../lib/filter');
// const BadRequest = require('../../lib/errors/BadRequest');

exports.list = (req, res, next) => {
  const params = binarize(req.query);

  // get the built query of stock assignment its parameters
  const sa = getStockAssignment(params);
  db.exec(sa.query, sa.queryParameters)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
};

exports.create = (req, res, next) => {
  const params = req.body;
  params.uuid = util.uuid();
  const sql = 'INSERT INTO stock_assign SET ?;';
  db.exec(sql, [binarize(params)])
    .then(() => {
      const update = 'UPDATE lot SET is_assigned = 1 WHERE uuid = ?;';
      return db.exec(update, [db.bid(params.lot_uuid)]);
    })
    .then(() => res.status(201).json({ uuid : params.uuid }))
    .catch(next)
    .done();
};

/**
 * @function binarize
 *
 * @description
 * returns binary version of given identifiers (uuids)
 *
 * @param {object} params an object which contains identifiers in string format
 * @returns {object} params with binary identifiers
 */
function binarize(params) {
  return db.convert(params, [
    'uuid',
    'depot_uuid',
    'lot_uuid',
    'inventory_uuid',
    'entity_uuid',
  ]);
}

/**
 * @function getStockAssignment
 *
 * @description
 * build the query for getting stock assignment based on
 * a given parameters
 *
 * @param {object} params
 * @returns {object} { query:..., queryParameters:... }
 */
function getStockAssignment(params) {
  const sql = `
    SELECT 
      BUID(sa.uuid) AS uuid, sa.description, sa.created_at, sa.quantity,
      BUID(l.uuid) AS lot_uuid, l.label,
      BUID(i.uuid) AS inventory_uuid, i.text, i.code,
      BUID(e.uuid) AS entity_uuid, e.display_name,
      BUID(d.uuid) AS depot_uuid, d.text AS depot_text
    FROM stock_assign sa
    JOIN lot l ON l.uuid = sa.lot_uuid AND sa.is_active = 1
    JOIN entity e ON e.uuid = sa.entity_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = sa.depot_uuid 
  `;

  const filters = new FilterParser(params);
  filters.equals('uuid', 'uuid', 'l');
  filters.equals('depot_text', 'text', 'd');
  filters.equals('depot_uuid', 'depot_uuid', 'sa');
  filters.equals('entity_uuid', 'entity_uuid', 'sa');
  filters.equals('inventory_uuid', 'uuid', 'i');
  filters.equals('text', 'text', 'i');
  filters.equals('label', 'label', 'l');
  filters.period('period', 'created_at', 'sa');
  filters.dateFrom('custom_period_start', 'created_at', 'sa');
  filters.dateTo('custom_period_end', 'created_at', 'sa');

  const query = filters.applyQuery(sql);
  const queryParameters = filters.parameters();
  return { query, queryParameters };
}
