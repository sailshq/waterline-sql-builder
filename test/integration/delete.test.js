var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('DELETE statements', function() {

    it('should generate an insert query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          del: true,
          from: 'accounts',
          where: {
            activated: false
          }
        },
        outcome: 'delete from "accounts" where "activated" = \'false\''
      }, done);
    });
    
  });
});
