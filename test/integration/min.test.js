var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('MIN statements', function() {

    it('should generate a min query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          min: [
            'active'
          ],
          from: 'users'
        },
        outcome: 'select min("active") from "users"'
      }, done);
    });

  });
});
