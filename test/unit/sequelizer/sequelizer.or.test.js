var Sequelizer = require('../../../index')({ dialect: 'postgres' }).sequelizer;
var analyze = require('../../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('Grouping statements with OR', function() {
    it('should generate a query when an OR statement is used', function() {
      var tree = analyze({
        select: ['*'],
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

      var result = Sequelizer(tree);
      assert.equal(result.sql, 'select * from "users" where "id" > $1 or "name" = $2');
      assert.deepEqual(result.bindings, ['10', 'Tester']);
    });

    it('should generate a query when nested OR statements are used', function() {
      var tree = analyze({
        select: ['*'],
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

      var result = Sequelizer(tree);
      assert.equal(result.sql, 'select * from "users" where ("id" = $1 or "id" > $2) or "name" = $3');
      assert.deepEqual(result.bindings, ['1', '10', 'Tester']);
    });

    it('should generate a query when complex OR statements are used', function() {
      var tree = analyze({
        select: ['*'],
        where: {
          or: [
            {
              and: [
                {
                  firstName: {
                    like: '%user0%'
                  }
                },
                {
                  type: 'or test'
                }
              ]
            },
            {
              and: [
                {
                  firstName: {
                    like: '%user1'
                  }
                },
                {
                  age: {
                    '>': 0
                  }
                },
                {
                  type: 'or test'
                }
              ]
            }
          ]
        },
        from: 'users'
      });

      var result = Sequelizer(tree);
      assert.equal(result.sql, 'select * from "users" where ("firstName" like $1 and "type" = $2) or ("firstName" like $3 and "age" > $4 and "type" = $5)');
      assert.deepEqual(result.bindings, ['%user0%', 'or test', '%user1', '0', 'or test']);
    });
  });
});
