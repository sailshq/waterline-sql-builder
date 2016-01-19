var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('NULL operator ::', function() {

    describe('IS NULL ::', function() {

      it('should generate a query when a NULL value is used', function(done) {
        Test({
          dialect: 'postgresql',
          query: {
            select: '*',
            from: 'users',
            where: {
              updatedAt: null
            }
          },
          outcome: 'select * from "users" where "updatedAt" is null'
        }, done);
      });

    });

  });
});
