var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('ORDER BY statements', function() {

    it('should generate a simple query with a FROM statement', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: '*',
          from: 'users',
          orderBy: [{ name: 'desc' },{ age: 'asc' }]
        },
        outcome: 'select * from "users" order by "name" desc, "age" asc'
      }, done);
    });

  });
});
