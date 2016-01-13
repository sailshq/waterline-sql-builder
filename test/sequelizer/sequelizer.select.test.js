var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('SELECT statements', function() {

    it('should generate a valid group for select "*"', function(done) {
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

    it('should generate a valid group for select when defined columns are used', function(done) {
      var tree = analyze({
        select: ['title', 'author', 'year'],
        from: 'books'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select "title", "author", "year" from "books"');
        return done();
      });
    });

  });
});
