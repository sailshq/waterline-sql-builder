var Test = require('./support/test-runner');

describe('Query Generation ::', function() {
  describe('DISTINCT statements', function() {

    it('should generate a distinct query', function(done) {
      Test({
        flavor: 'postgresql',
        query: {
          select: {
            distinct: ['firstName', 'lastName']
          },
          from: 'customers'
        },
        outcome: 'select distinct "firstName", "lastName" from "customers"'
      }, done);
    });

  });
});
