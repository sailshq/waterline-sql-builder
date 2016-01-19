var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('WHERE NOT statements', function() {

    it('should generate a query with a WHERE NOT statement', function(done) {
      Test({
        dialect: 'postgresql',
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

    it('should generate a query when nested WHERE NOT statements are used', function(done) {
      Test({
        dialect: 'postgresql',
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

    it('should generate a query when operators are used', function(done) {
      Test({
        dialect: 'postgresql',
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

    it('should generate a query when multiple operators are used', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
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
        },
        outcome: 'select * from "users" where "name" = \'John\' or ("votes" > \'100\' and not "title" = \'Admin\')'
      }, done);
    });

  });
});
