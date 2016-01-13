var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('SELECT statements', function() {

    it('should generate a select * query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: '*',
          from: 'books'
        },
        outcome: 'select * from "books"'
      }, done);
    });

    it('should generate a select query using defined columns', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: ['title', 'author', 'year'],
          from: 'books'
        },
        outcome: 'select "title", "author", "year" from "books"'
      }, done);
    });

  });
});
