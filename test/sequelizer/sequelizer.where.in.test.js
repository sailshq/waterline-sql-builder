var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('WHERE IN statements', function() {
    it('should generate a query', function(done) {
      var tree = analyze({
        select: ['name'],
        from: 'users',
        where: {
          id: {
            in: [1, 2, 3]
          }
        }
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result.sql, 'select "name" from "users" where "id" in ($1, $2, $3)');
        assert.deepEqual(result.bindings, ['1', '2', '3']);
        return done();
      });
    });

    it('should generate a query when in an OR statement', function(done) {
      var tree = analyze({
        select: ['name'],
        from: 'users',
        where: {
          or: [
            {
              id: {
                in: [1, 2, 3]
              }
            },
            {
              id: {
                in: [4, 5, 6]
              }
            }
          ]
        }
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result.sql, 'select "name" from "users" where "id" in ($1, $2, $3) or "id" in ($4, $5, $6)');
        assert.deepEqual(result.bindings, ['1', '2', '3', '4', '5', '6']);
        return done();
      });
    });
  });
});
