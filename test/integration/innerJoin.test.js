var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('INNER JOINS ::', function() {

    it('should generate a basic inner join query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: ['users.id', 'contacts.phone'],
          from: 'users',
          innerJoin: [
            {
              from: 'contacts',
              on: {
                users: 'id',
                contacts: 'user_id'
              }
            }
          ]
        },
        outcome: 'select "users"."id", "contacts"."phone" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id"'
      }, done);
    });

  });
});
