var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('JOINS ::', function() {

    it('should generate a basic join query', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: ['users.id', 'contacts.phone'],
          from: 'users',
          join: [
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

    it('should be able to contain multiple joins', function(done) {
      Test({
        dialect: 'postgresql',
        query: {
          select: ['users.id', 'contacts.phone', 'carriers.name'],
          from: 'users',
          join: [
            {
              from: 'contacts',
              on: {
                users: 'id',
                contacts: 'user_id'
              }
            },
            {
              from: 'carriers',
              on: {
                users: 'id',
                carriers: 'user_id'
              }
            }
          ]
        },
        outcome: 'select "users"."id", "contacts"."phone", "carriers"."name" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id" inner join "carriers" on "users"."id" = "carriers"."user_id"'
      }, done);
    });

  });
});
