var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('UPDATE statements', function() {

    it('should generate a simple query with an UPDATE statement', function(done) {
      var tree = analyze({
        update: {
          status: 'archived'
        },
        where: {
          publishedDate: { '>': 2000 }
        },
        using: 'books'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'update "books" set "status" = \'archived\' where "publishedDate" > \'2000\'');
        return done();
      });
    });

    it('should generate a query with multiple values being inserted', function(done) {
      var tree = analyze({
        update: {
          status: 'archived',
          active: false
        },
        where: {
          publishedDate: { '>': 2000 }
        },
        using: 'books'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err, err);
        assert.equal(result, 'update "books" set "active" = \'false\', "status" = \'archived\' where "publishedDate" > \'2000\'');
        return done();
      });
    });

  });
});
