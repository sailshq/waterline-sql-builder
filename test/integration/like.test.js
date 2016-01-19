var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('LIKE operator ::', function() {

    it('should generate a LIKE query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: '*',
          from: 'users',
          where: {
            or: [
              {
                name: {
                  like: '%Test%'
                }
              },
              {
                not: {
                  id: {
                    in: [1,2,3]
                  }
                }
              }
            ]
          }
        },
        outcome: 'select * from "users" where "name" like \'\%Test\%\' or "id" not in (\'1\', \'2\', \'3\')'
      }, done);
    });

  });
});
