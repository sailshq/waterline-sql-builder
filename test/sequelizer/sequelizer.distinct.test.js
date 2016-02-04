var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('DISTINCT statements', function() {
    it('should generate a distinct query', function(done) {
      var tree = analyze({
        select: {
          distinct: ['firstName', 'lastName']
        },
        from: 'customers'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result.sql, 'select distinct "firstName", "lastName" from "customers"');
        return done();
      });
    });
  });
});
