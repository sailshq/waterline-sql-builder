var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('RIGHT JOINS ::', function() {

    it('should generate a basic right join query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: ['users.id', 'contacts.phone'],
          from: 'users',
          rightJoin: [
            {
              from: 'contacts',
              on: {
                users: 'id',
                contacts: 'user_id'
              }
            }
          ]
        },
        outcome: 'select "users"."id", "contacts"."phone" from "users" right join "contacts" on "users"."id" = "contacts"."user_id"'
      }, done);
    });

  });
});
