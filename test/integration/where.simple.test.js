var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('Simple WHERE statements', function() {

    it('should generate a query with a simple WHERE statement', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: ['id'],
          where: {
            firstName: 'Test',
            lastName: 'User'
          },
          from: 'users'
        },
        outcome: 'select "id" from "users" where "firstName" = \'Test\' and "lastName" = \'User\''
      }, done);
    });

    it('should generate a query when operators are used', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: '*',
          where: {
            votes: { '>': 100 }
          },
          from: 'users'
        },
        outcome: 'select * from "users" where "votes" > \'100\''
      }, done);
    });

    it('should generate a query when multiple operators are used', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: '*',
          where: {
            votes: { '>': 100, '<': 200 }
          },
          from: 'users'
        },
        outcome: 'select * from "users" where "votes" > \'100\' and "votes" < \'200\''
      }, done);
    });

    it('should generate a query when multiple columns and operators are used', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: '*',
          where: {
            votes: { '>': 100 },
            age: { '<': 50 }
          },
          from: 'users'
        },
        outcome: 'select * from "users" where "votes" > \'100\' and "age" < \'50\''
      }, done);
    });

  });
});
