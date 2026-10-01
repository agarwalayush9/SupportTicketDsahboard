const { Router } = require('express');
const { body, query, param } = require('express-validator');
const repo = require('../db/ticketRepository');
const { handleValidationErrors } = require('../middleware/validate');

const router = Router();

const VALID_STATUSES = ['Open', 'In Progress', 'Resolved'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

// ─── Validators ────────────────────────────────────────────────────────────

const createValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 120 }).withMessage('Title must be at most 120 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Customer email is required.')
    .isEmail().withMessage('Customer email must be a valid email address.'),
  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`),
  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}.`),
];

const updateValidators = [
  param('id').isInt({ gt: 0 }).withMessage('Ticket ID must be a positive integer.'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}.`),
  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`),
  body()
    .custom((_, { req }) => {
      if (req.body.status === undefined && req.body.priority === undefined) {
        throw new Error('At least one of status or priority must be provided.');
      }
      return true;
    }),
];

const listValidators = [
  query('page').optional().isInt({ gt: 0 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ gt: 0 }).withMessage('Limit must be a positive integer.'),
  query('sort').optional().isIn(['asc', 'desc']).withMessage('Sort must be "asc" or "desc".'),
  query('status').optional().isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}.`),
  query('priority').optional().isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`),
];

// ─── Routes ────────────────────────────────────────────────────────────────

/**
 * GET /api/tickets/summary
 * Returns total count and per-status counts (not affected by filters).
 */
router.get('/summary', (req, res) => {
  const counts = repo.getSummaryCounts();
  res.json(counts);
});

/**
 * GET /api/tickets
 * List tickets with optional search, filter, sort, pagination.
 */
router.get('/', listValidators, handleValidationErrors, (req, res) => {
  const { search, status, priority, sort, page, limit } = req.query;
  const result = repo.listTickets({ search, status, priority, sort, page, limit });
  res.json(result);
});

/**
 * GET /api/tickets/:id
 * Get a single ticket by ID.
 */
router.get('/:id', [param('id').isInt({ gt: 0 })], handleValidationErrors, (req, res) => {
  const ticket = repo.getTicketById(parseInt(req.params.id, 10));
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }
  res.json(ticket);
});

/**
 * POST /api/tickets
 * Create a new ticket.
 */
router.post('/', createValidators, handleValidationErrors, (req, res) => {
  const { title, description, email, priority, status } = req.body;
  const ticket = repo.createTicket({ title, description, email, priority, status });
  res.status(201).json(ticket);
});

/**
 * PATCH /api/tickets/:id
 * Update status and/or priority of an existing ticket.
 */
router.patch('/:id', updateValidators, handleValidationErrors, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = repo.getTicketById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }
  const updated = repo.updateTicket(id, req.body);
  res.json(updated);
});

module.exports = router;
