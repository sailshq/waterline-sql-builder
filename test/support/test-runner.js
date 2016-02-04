/**
 * Given a db flavor and a query object, generate the SQL statement and test
 * it against the expected outcome.
 */

var assert = require('assert');
var async = require('async');
var Pack = require('../../index');

module.exports = function(test, cb) {
  var testDialect = function testDialect(outcome, next) {
    Pack.generateSql({
      dialect: outcome.dialect,
      query: test.query
    }).exec({
      success: function(results) {
        try {
          assert.equal(results.sql, outcome.sql, outcome.dialect);
          if (outcome.bindings) {
            assert.deepEqual(results.bindings, outcome.bindings, outcome.dialect);
          }
        } catch (e) {
          e.dialect = outcome.dialect;
          return cb(e);
        }

        return next();
      },
      error: function(err) {
        return next(err);
      }
    });
  };

  async.each(test.outcomes, testDialect, cb);
};
