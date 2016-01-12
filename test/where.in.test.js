var Test = require('./support/test-runner');

describe('Query Generation ::', function() {
  describe('WHERE IN statements', function() {

    it('should generate a where in clause', function(done) {
      Test({
        flavor: 'postgresql',
        query: {
          select: ['name'],
          from: 'users',
          where: {
            or: [
              {
                id: {
                  in: [1,2,3]
                }
              },
              {
                id: {
                  in: [4,5,6]
                }
              }
            ]
          }
        },
        outcome: 'select "name" from "users" where "id" in (\'1\', \'2\', \'3\') or "id" in (\'4\', \'5\', \'6\')'
      }, done);
    });

  });
});
