var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('COUNT statements', function() {

    it('should generate a distinct query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          count: [
            'active'
          ],
          from: 'users'
        },
        outcome: 'select count("active") from "users"'
      }, done);
    });

  });
});
