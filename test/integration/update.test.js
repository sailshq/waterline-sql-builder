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

    it('should generate an update query where order doesn\'t matter', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          where: {
            type: 'test'
          },
          using: 'user',
          update: {
            age: 10
          },
        },
        outcome: 'update "user" set "age" = \'10\' where "type" = \'test\''
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
