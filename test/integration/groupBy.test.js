var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('GROUP BY statements', function() {

    it('should generate a group by query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: '*',
          from: 'users',
          groupBy: ['count']
        },
        outcome: 'select * from "users" group by "count"'
      }, done);
    });

  });
});
