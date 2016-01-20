var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('MAX statements', function() {

    it('should generate a max query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          max: [
            'active'
          ],
          from: 'users'
        },
        outcome: 'select max("active") from "users"'
      }, done);
    });

  });
});
