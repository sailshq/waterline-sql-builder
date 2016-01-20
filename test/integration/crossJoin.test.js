var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('CROSS JOINS ::', function() {

    it('should generate a basic cross join query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: ['users.id', 'contacts.phone'],
          from: 'users',
          crossJoin: [
            {
              from: 'contacts',
              on: {
                users: 'id',
                contacts: 'user_id'
              }
            }
          ]
        },
        outcome: 'select "users"."id", "contacts"."phone" from "users" cross join "contacts" on "users"."id" = "contacts"."user_id"'
      }, done);
    });

  });
});
