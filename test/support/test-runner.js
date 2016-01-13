/**
 * Given a db flavor and a query object, generate the SQL statement and test
 * it against the expected outcome.
 */

var assert = require('assert');
var Pack = require('../../index');

module.exports = function(test, cb) {

  Pack.generateSql({
    dialect: test.flavor,
    query: test.query
  }).exec({

    success: function(results) {
      assert.equal(results, test.outcome);
      return cb();
    },

    error: function(err) {
      return cb(err);
    }

  });

};
