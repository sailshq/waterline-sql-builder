var Sequelizer = require('../../../index').sequelizer;
var analyze = require('../../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('COUNT statements', function() {
    it('should generate a count query', function(done) {
      var tree = analyze({
        count: [
          'active'
        ],
        from: 'users'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result.sql, 'select count("active") from "users"');
        return done();
      });
    });
  });
});
