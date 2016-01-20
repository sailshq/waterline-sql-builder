var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('ORDER BY statements', function() {

    it('should generate a simple query with ORDER BY statements', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        orderBy: [{ name: 'desc' },{ age: 'asc' }]
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select * from "users" order by "name" desc, "age" asc');
        return done();
      });
    });

  });
});
