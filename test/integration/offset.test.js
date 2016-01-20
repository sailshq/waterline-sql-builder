var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('OFFSET statements', function() {

    it('should generate a simple query with a OFFSET statement', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: '*',
          from: 'users',
          offset: 10
        },
        outcome: 'select * from "users" offset \'10\''
      }, done);
    });

  });
});
