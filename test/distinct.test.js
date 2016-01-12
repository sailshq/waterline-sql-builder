var Test = require('./support/test-runner');

describe('Query Generation ::', function() {
  describe('DISTINCT statements', function() {

    it('should generate a distinct query', function(done) {
      Test({
        flavor: 'postgresql',
        query: {
          from: 'customers',
          select: {
            distinct: ['firstName', 'lastName']
          },
        },
        outcome: 'select distinct "firstName", "lastName" from "customers"'
      }, done);
    });

  });
});
