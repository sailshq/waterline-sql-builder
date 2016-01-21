var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('INSERT statements', function() {

    it('should generate an insert query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          insert: {
            title: 'Slaughterhouse Five'
          },
          into: 'books'
        },
        outcome: 'insert into "books" ("title") values (\'Slaughterhouse Five\') returning "id"'
      }, done);
    });

    it('should generate an insert query when using multiple values', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          insert: {
            title: 'Slaughterhouse Five',
            author: 'Kurt Vonnegut'
          },
          into: 'books'
        },
        outcome: 'insert into "books" ("author", "title") values (\'Kurt Vonnegut\', \'Slaughterhouse Five\') returning "id"'
      }, done);
    });

  });
});
