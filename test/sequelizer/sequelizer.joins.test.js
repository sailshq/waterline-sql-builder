var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('JOIN statements', function() {

    it('should generate a query when a JOIN statement is added', function(done) {
      var tree = analyze({
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
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select "users"."id", "contacts"."phone" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id"');
        return done();
      });
    });

    it('should generate a query when a multiple JOIN statements are added', function(done) {
      var tree = analyze({
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
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select "users"."id", "contacts"."phone", "carriers"."name" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id" inner join "carriers" on "users"."id" = "carriers"."user_id"');
        return done();
      });
    });

  });
});
