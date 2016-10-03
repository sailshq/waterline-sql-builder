var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('INSERT statements', function() {
    it('should generate an insert query', function(done) {
      Test({
        query: {
          insert: {
            title: 'Slaughterhouse Five'
          },
          into: 'books'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'insert into "books" ("title") values ($1)',
            bindings: ['Slaughterhouse Five']
          },
          {
            dialect: 'mysql',
            sql: 'insert into `books` (`title`) values (?)',
            bindings: ['Slaughterhouse Five']
          },
          {
            dialect: 'sqlite3',
            sql: 'insert into "books" ("title") values (?)',
            bindings: ['Slaughterhouse Five']
          },
          {
            dialect: 'oracle',
            sql: 'insert into "books" ("title") values (:1)',
            bindings: ['Slaughterhouse Five']
          },
          {
            dialect: 'mariadb',
            sql: 'insert into `books` (`title`) values (?)',
            bindings: ['Slaughterhouse Five']
          }
        ]
      }, done);
    });

    it('should generate an insert query when using multiple values', function(done) {
      Test({
        query: {
          insert: {
            title: 'Slaughterhouse Five',
            author: 'Kurt Vonnegut'
          },
          into: 'books'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'insert into "books" ("author", "title") values ($1, $2)',
            bindings: ['Kurt Vonnegut', 'Slaughterhouse Five']
          },
          {
            dialect: 'mysql',
            sql: 'insert into `books` (`author`, `title`) values (?, ?)',
            bindings: ['Kurt Vonnegut', 'Slaughterhouse Five']
          },
          {
            dialect: 'sqlite3',
            sql: 'insert into "books" ("author", "title") values (?, ?)',
            bindings: ['Kurt Vonnegut', 'Slaughterhouse Five']
          },
          {
            dialect: 'oracle',
            sql: 'insert into "books" ("author", "title") values (:1, :2)',
            bindings: ['Kurt Vonnegut', 'Slaughterhouse Five']
          },
          {
            dialect: 'mariadb',
            sql: 'insert into `books` (`author`, `title`) values (?, ?)',
            bindings: ['Kurt Vonnegut', 'Slaughterhouse Five']
          }
        ]
      }, done);
    });
  });
});
