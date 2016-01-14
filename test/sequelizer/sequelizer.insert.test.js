var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('INSERT statements', function() {

    it('should generate a simple query with a FROM statement', function(done) {
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
        assert.equal(result, 'insert into "books" ("title") values (\'Slaughterhouse Five\')');
        return done();
      });
    });

  });
});
