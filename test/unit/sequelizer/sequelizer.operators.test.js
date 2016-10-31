var Sequelizer = require('../../../index')({ dialect: 'postgres' }).sequelizer;
var analyze = require('../../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('Various Operators', function() {
    it('should generate a query for LIKE operators', function() {
      var tree = analyze({
        select: ['*'],
        from: 'users',
        where: {
          or: [
            {
              name: {
                like: '%Test%'
              }
            },
            {
              not: {
                id: {
                  in: [1, 2, 3]
                }
              }
            }
          ]
        }
      });

      var result = Sequelizer(tree);
      assert.equal(result.sql, 'select * from "users" where "name" like $1 or "id" not in ($2, $3, $4)');
      assert.deepEqual(result.bindings, ['%Test%', '1', '2', '3']);
    });
  });
});
