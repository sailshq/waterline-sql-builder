var Test = require('./support/test-runner');

describe('Query Generation ::', function() {
  describe('WHERE NOT statements', function() {

    it('should generate a where not clause', function(done) {
      Test({
        flavor: 'postgresql',
        query: {
          select: ['id'],
          from: 'users',
          where: {
            not: {
              firstName: 'Test',
              lastName: 'User'
            }
          }
        },
        outcome: 'select "id" from "users" where not "firstName" = \'Test\' and not "lastName" = \'User\''
      }, done);
    });

    it('should generate a where not clause with operators', function(done) {
      Test({
        flavor: 'postgresql',
        query: {
          select: '*',
          from: 'users',
          where: {
            not: {
              votes: { '>': 100 }
            }
          }
        },
        outcome: 'select * from "users" where not "votes" > \'100\''
      }, done);
    });


    it('should work with a grouped clause using OR', function(done) {
      Test({
        flavor: 'postgresql',
        query: {
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
        },
        outcome: 'select * from "users" where not ("id" = \'1\' or not "id" > \'10\') or not "name" = \'Tester\''
      }, done);
    });

  });
});
