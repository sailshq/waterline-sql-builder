var Sequelizer = require('../../../index').sequelizer;
var analyze = require('../../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('RETURNING statements', function() {
    it('should generate a simple query with a RETURNING statement', function(done) {
      var tree = analyze({
        insert: {
          title: 'Slaughterhouse Five'
        },
        into: 'books',
        returning: 'author'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result.sql, 'insert into "books" ("title") values ($1) returning "author"');
        assert.deepEqual(result.bindings, ['Slaughterhouse Five']);
        return done();
      });
    });

    it('should generate a query with multiple values being returned', function(done) {
      var tree = analyze({
        insert: {
          title: 'Slaughterhouse Five',
          author: 'Kurt Vonnegut'
        },
        into: 'books',
        returning: ['author', 'title']
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err, err);
        assert.equal(result.sql, 'insert into "books" ("author", "title") values ($1, $2) returning "author", "title"');
        assert.deepEqual(result.bindings, ['Kurt Vonnegut', 'Slaughterhouse Five']);
        return done();
      });
    });

    it('should generate a query with all values being returned', function(done) {
      var tree = analyze({
        insert: {
          title: 'Slaughterhouse Five',
          author: 'Kurt Vonnegut'
        },
        into: 'books',
        returning: '*'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err, err);
        assert.equal(result.sql, 'insert into "books" ("author", "title") values ($1, $2) returning *');
        assert.deepEqual(result.bindings, ['Kurt Vonnegut', 'Slaughterhouse Five']);
        return done();
      });
    });
  });
});
