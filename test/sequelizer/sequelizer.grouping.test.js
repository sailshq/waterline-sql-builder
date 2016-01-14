var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('Grouping statements with OR', function() {

    it('should generate a query when an OR statement is used', function(done) {
      var tree = analyze({
        select: '*',
        where: {
          or: [
            {
              id: { '>': 10 }
            },
            {
              name: 'Tester'
            }
          ]
        },
        from: 'users'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select * from "users" where "id" > \'10\' or "name" = \'Tester\'');
        return done();
      });
    });

    it('should generate a query when nested OR statements are used', function(done) {
      var tree = analyze({
        select: '*',
        where: {
          or: [
            {
              or: [
                { id: 1 },
                { id: { '>': 10 } }
              ]
            },
            {
              name: 'Tester'
            }
          ]
        },
        from: 'users'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select * from "users" where ("id" = \'1\' or "id" > \'10\') or "name" = \'Tester\'');
        return done();
      });
    });

  });
});
