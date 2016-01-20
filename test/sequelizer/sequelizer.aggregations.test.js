var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('Aggregations', function() {

    it('should generate a group by query', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        groupBy: ['count']
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select * from "users" group by "count"');
        return done();
      });
    });

  });
});
