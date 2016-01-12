var Test = require('./support/test-runner');

describe('Query Generation ::', function() {
  describe('Grouping with OR statements', function() {

    it('should generate a where clause when using a single level OR', function(done) {
      Test({
        flavor: 'postgresql',
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

    it('should generate a where clause when using nested OR clause', function(done) {
      Test({
        flavor: 'postgresql',
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
