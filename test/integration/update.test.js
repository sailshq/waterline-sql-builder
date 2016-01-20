var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('UPDATE statements', function() {

    it('should generate an update query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          update: {
            status: 'archived'
          },
          where: {
            publishedDate: { '>': 2000 }
          },
          using: 'books'
        },
        outcome: 'update "books" set "status" = \'archived\' where "publishedDate" > \'2000\''
      }, done);
    });

    it('should generate an insert query when using multiple values', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          update: {
            status: 'archived',
            active: false
          },
          where: {
            publishedDate: { '>': 2000 }
          },
          using: 'books'
        },
        outcome: 'update "books" set "active" = \'false\', "status" = \'archived\' where "publishedDate" > \'2000\''
      }, done);
    });

  });
});
