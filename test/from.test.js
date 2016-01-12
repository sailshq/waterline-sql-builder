var Test = require('./support/test-runner');

describe('Query Generation ::', function() {
  describe('FROM statements', function() {

    it('should generate a simple query with a FROM statement', function(done) {
      Test({
        flavor: 'postgresql',
        query: {
          select: '*',
          from: 'books'
        },
        outcome: 'select * from "books"'
      }, done);
    });

    it('should support schemas in the FROM statement', function(done) {
      Test({
        flavor: 'postgresql',
        query: {
          select: ['title', 'author', 'year'],
          from: { table: 'books', schema: 'foo' }
        },
        outcome: 'select "title", "author", "year" from "foo"."books"'
      }, done);
    });

  });
});
