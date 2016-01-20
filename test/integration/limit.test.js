var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('LIMIT statements', function() {

    it('should generate a simple query with a LIMIT statement', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: '*',
          from: 'users',
          limit: 10
        },
        outcome: 'select * from "users" limit \'10\''
      }, done);
    });

  });
});
