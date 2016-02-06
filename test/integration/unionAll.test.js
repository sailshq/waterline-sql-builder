var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('UNION ALL statements', function() {
    it('should generate a UNION ALL query', function(done) {
      Test({
        query: {
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
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" where "firstName" = $1 union all (select * from "users" where "lastName" = $2) as "u_0" union all (select * from "users" where "middleName" = $3) as "u_1"',
            bindings: ['Bob', 'Smith', 'Allen']
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` where `firstName` = ? union all (select * from `users` where `lastName` = ?) as `u_0` union all (select * from `users` where `middleName` = ?) as `u_1`',
            bindings: ['Bob', 'Smith', 'Allen']
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" where "firstName" = ? union all (select * from "users" where "lastName" = ?) as "u_0" union all (select * from "users" where "middleName" = ?) as "u_1"',
            bindings: ['Bob', 'Smith', 'Allen']
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" where "firstName" = :1 union all (select * from "users" where "lastName" = :2) "u_0" union all (select * from "users" where "middleName" = :3) "u_1"',
            bindings: ['Bob', 'Smith', 'Allen']
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` where `firstName` = ? union all (select * from `users` where `lastName` = ?) as `u_0` union all (select * from `users` where `middleName` = ?) as `u_1`',
            bindings: ['Bob', 'Smith', 'Allen']
          }
        ]
      }, done);
    });
  });
});
