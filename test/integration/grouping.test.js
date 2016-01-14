var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('Grouping statements with OR', function() {

    it('should generate a query when an OR statement is present', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
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
        },
        outcome: 'select * from "users" where "id" > \'10\' or "name" = \'Tester\''
      }, done);
    });

    it('should generate a query when a nested OR statement is used', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
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
        },
        outcome: 'select * from "users" where ("id" = \'1\' or "id" > \'10\') or "name" = \'Tester\''
      }, done);
    });

  });
});
