import mongoose from 'mongoose';

/** An error that carries an HTTP status code for the API response. */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, message, details);
export const notFound = (message) => new HttpError(404, message);
export const conflict = (message) => new HttpError(409, message);

/** Trims a value to a string; returns '' for null/undefined. */
export function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

/** Normalizes a course ID the same way the Course schema does. */
export function normalizeCourseId(value) {
  return clean(value).replace(/\s+/g, ' ').toUpperCase();
}

/** Throws a 400 listing every required field that is empty. */
export function requireFields(body, fields) {
  const missing = fields.filter(([key]) => clean(body?.[key]) === '');
  if (missing.length) {
    const labels = missing.map(([, label]) => label);
    throw badRequest(`Missing required field(s): ${labels.join(', ')}`, {
      fields: Object.fromEntries(missing.map(([key, label]) => [key, `${label} is required`])),
    });
  }
}

/** Express error handler: converts any thrown error into a JSON response. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details && { details: err.details }) });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const fields = Object.fromEntries(Object.entries(err.errors).map(([key, e]) => [key, e.message]));
    return res.status(400).json({ error: Object.values(fields).join('. '), details: { fields } });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: `Invalid value for ${err.path}` });
  }

  // Duplicate key from a unique index (e.g. a race between two identical requests).
  if (err?.code === 11000) {
    return res.status(409).json({ error: 'A record with the same unique value already exists' });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }

  if (err instanceof mongoose.Error.MongooseServerSelectionError || err?.name === 'MongoNetworkError') {
    return res.status(503).json({ error: 'The database is unavailable. Please try again shortly.' });
  }

  console.error(`Unexpected error on ${req.method} ${req.originalUrl}:`, err);
  return res.status(500).json({ error: 'Internal server error' });
}
