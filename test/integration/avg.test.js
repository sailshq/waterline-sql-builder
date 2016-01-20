var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('AVG statements', function() {

    it('should generate a avg query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          avg: [
            'active'
          ],
          from: 'users'
        },
        outcome: 'select avg("active") from "users"'
      }, done);
    });

  });
});
