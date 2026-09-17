/*
 * Finland Ice Hockey Tournament Platform
 * File: middleware/errors.js
 * Author: Zawal and Abdullah (Backend Architecture, Database and DevOps)
 * Purpose: 404 handler and global error handler that render the shared error page
 */

function notFound(req, res, next) {
  res.status(404).render('pages/error', {
    page: '',
    title: 'Page Not Found',
    status: 404,
    message: "We couldn't find what you were looking for."
  });
}

function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).render('pages/error', {
    page: '',
    title: 'Something went wrong',
    status,
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message
  });
}

module.exports = { notFound, errorHandler };
