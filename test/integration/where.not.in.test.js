var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('WHERE NOT IN statements', function() {

    it('should generate a query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: ['name'],
          from: 'users',
          where: {
            not: {
              id: {
                in: [1,2,3]
              }
            }
          }
        },
        outcome: 'select "name" from "users" where "id" not in (\'1\', \'2\', \'3\')'
      }, done);
    });

    it('should generate a query when inside an OR statement', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: ['name'],
          from: 'users',
          where: {
            or: [
              {
                not: {
                  id: {
                    in: [1,2,3]
                  }
                }
              },
              {
                not: {
                  id: {
                    in: [4,5,6]
                  }
                }
              }
            ]
          }
        },
        outcome: 'select "name" from "users" where "id" not in (\'1\', \'2\', \'3\') or "id" not in (\'4\', \'5\', \'6\')'
      }, done);
    });

    it('should generate a query when inside an OR statement with multiple criteria', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: ['name'],
          from: 'users',
          where: {
            or: [
              {
                not: {
                  id: {
                    in: [1,2,3]
                  }
                },
                age: 21
              },
              {
                not: {
                  id: {
                    in: [4,5,6]
                  }
                }
              }
            ]
          }
        },
        outcome: 'select "name" from "users" where ("id" not in (\'1\', \'2\', \'3\') and "age" = \'21\') or "id" not in (\'4\', \'5\', \'6\')'
      }, done);
    });

  });
});
