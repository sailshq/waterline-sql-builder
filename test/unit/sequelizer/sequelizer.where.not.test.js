var Sequelizer = require('../../../index')({ dialect: 'postgres' }).sequelizer;
var analyze = require('../../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('WHERE NOT statements', function() {
    it('should generate a query', function() {
      var tree = analyze({
        select: ['id'],
        from: 'users',
        where: {
          not: {
            firstName: 'Test',
            lastName: 'User'
          }
        }
      });

      var result = Sequelizer(tree);
      assert.equal(result.sql, 'select "id" from "users" where not "firstName" = $1 and not "lastName" = $2');
      assert.deepEqual(result.bindings, ['Test', 'User']);
    });

    it('should generate a query with nested WHERE NOT statements', function() {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          or: [
            {
              not: {
                or: [
                  {
                    id: 1
                  },
                  {
                    not: {
                      id: {
                        '>': 10
                      }
                    }
                  }
                ]
              }
            },
            {
              not: {
                name: 'Tester'
              }
            }
          ]
        }
      });

      var result = Sequelizer(tree);
      assert.equal(result.sql, 'select * from "users" where not ("id" = $1 or not "id" > $2) or not "name" = $3');
      assert.deepEqual(result.bindings, ['1', '10', 'Tester']);
    });

    it('should generate a query when operators are used', function() {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          not: {
            votes: { '>': 100 }
          }
        }
      });

      var result = Sequelizer(tree);
      assert.equal(result.sql, 'select * from "users" where not "votes" > $1');
      assert.deepEqual(result.bindings, ['100']);
    });

    it('should generate a query when multiple operators are used', function() {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          or: [
            { name: 'John' },
            {
              votes: { '>': 100 },
              not: {
                title: 'Admin'
              }
            }
          ]
        }
      });

      var result = Sequelizer(tree);
      assert.equal(result.sql, 'select * from "users" where "name" = $1 or ("votes" > $2 and not "title" = $3)');
      assert.deepEqual(result.bindings, ['John', '100', 'Admin']);
    });

    it('should generate a query when AND arrays are used', function() {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          and: [
            {
              name: 'John'
            },
            {
              not: {
                title: 'Admin'
              }
            }
          ]
        }
      });

      var result = Sequelizer(tree);
      assert.equal(result.sql, 'select * from "users" where "name" = $1 and not "title" = $2');
      assert.deepEqual(result.bindings, ['John', 'Admin']);
    });
  });
});
