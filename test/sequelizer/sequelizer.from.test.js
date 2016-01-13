var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
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
        assert.equal(result, 'select * from "books"');
        return done();
      });
    });

    it('should support schemas in the FROM statement', function(done) {
      var tree = analyze({
        select: ['title', 'author', 'year'],
        from: { table: 'books', schema: 'foo' }
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select "title", "author", "year" from "foo"."books"');
        return done();
      });
    });

  });
});
