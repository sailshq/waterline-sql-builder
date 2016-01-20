var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('LEFT OUTER JOINS ::', function() {

    it('should generate a basic left outer join query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: ['users.id', 'contacts.phone'],
          from: 'users',
          leftOuterJoin: [
            {
              from: 'contacts',
              on: {
                users: 'id',
                contacts: 'user_id'
              }
            }
          ]
        },
        outcome: 'select "users"."id", "contacts"."phone" from "users" left outer join "contacts" on "users"."id" = "contacts"."user_id"'
      }, done);
    });

  });
});
