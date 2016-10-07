var Sequelizer = require('../../../index').sequelizer;
var analyze = require('../../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('OPTS', function() {
    it('should support schemas', function(done) {
      var tree = analyze({
        select: ['title', 'author', 'year'],
        from: 'books',
        opts: {
          schema: 'foo'
        }
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result.sql, 'select "title", "author", "year" from "foo"."books"');
        return done();
      });
    });
  });
});
