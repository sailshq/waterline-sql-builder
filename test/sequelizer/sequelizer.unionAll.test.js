var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('UNION ALL statements', function() {
    it('should generate a simple query with a UNION statement', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          firstName: 'Bob'
        },
        unionAll: [
          {
            select: '*',
            from: 'users',
            where: {
              lastName: 'Smith'
            }
          },
          {
            select: '*',
            from: 'users',
            where: {
              middleName: 'Allen'
            }
          }
        ]
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result.sql, 'select * from "users" where "firstName" = $1 union all (select * from "users" where "lastName" = $2) as "u_0" union all (select * from "users" where "middleName" = $3) as "u_1"');
        assert.deepEqual(result.bindings, ['Bob', 'Smith', 'Allen']);
        return done();
      });
    });
  });
});
