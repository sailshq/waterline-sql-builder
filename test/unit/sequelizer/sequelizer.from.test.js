var Sequelizer = require('../../../index').sequelizer;
var analyze = require('../../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('FROM statements', function() {
    it('should generate a simple query with a FROM statement', function(done) {
      var tree = analyze({
        select: '*',
        from: 'books'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result.sql, 'select * from "books"');
        return done();
      });
    });
  });
});
