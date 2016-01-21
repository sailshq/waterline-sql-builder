var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('INSERT statements', function() {

    it('should generate a simple query with an INSERT statement', function(done) {
      var tree = analyze({
        insert: {
          title: 'Slaughterhouse Five'
        },
        into: 'books'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'insert into "books" ("title") values (\'Slaughterhouse Five\') returning "id"');
        return done();
      });
    });

    it('should generate a query with multiple values being inserted', function(done) {
      var tree = analyze({
        insert: {
          title: 'Slaughterhouse Five',
          author: 'Kurt Vonnegut'
        },
        into: 'books'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err, err);
        assert.equal(result, 'insert into "books" ("author", "title") values (\'Kurt Vonnegut\', \'Slaughterhouse Five\') returning "id"');
        return done();
      });
    });

  });
});
