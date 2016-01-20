var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('SUM statements', function() {

    it('should generate a sum query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          sum: [
            'active'
          ],
          from: 'users'
        },
        outcome: 'select sum("active") from "users"'
      }, done);
    });

  });
});
