var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('DELETE statements', function() {

    it('should generate a simple query with an DELETE statement', function(done) {
      var tree = analyze({
        del: true,
        from: 'accounts',
        where: {
          activated: false
        }
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result.sql, 'delete from "accounts" where "activated" = $1 returning "id"');
        assert.deepEqual(result.bindings, ['false']);
        return done();
      });
    });

  });
});
