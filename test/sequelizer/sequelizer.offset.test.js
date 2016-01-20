var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('OFFSET statements', function() {

    it('should generate a simple query with a OFFSET statement', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        offset: 10
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select * from "users" offset \'10\'');
        return done();
      });
    });

  });
});
