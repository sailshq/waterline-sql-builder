var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('WHERE Simple statements', function() {

    it('should generate a query with a simple WHERE statement', function(done) {
      var tree = analyze({
        select: ['id'],
        where: {
          firstName: 'Test',
          lastName: 'User'
        },
        from: 'users'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select "id" from "users" where "firstName" = \'Test\' and "lastName" = \'User\'');
        return done();
      });
    });

    it('should generate a valid query when operators are used', function(done) {
      var tree = analyze({
        select: '*',
        where: {
          votes: { '>': 100 }
        },
        from: 'users'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select * from "users" where "votes" > \'100\'');
        return done();
      });
    });

    it('should generate a valid query when multiple operators are used', function(done) {
      var tree = analyze({
        select: '*',
        where: {
          votes: {
            '>': 100,
            '<': 200
          }
        },
        from: 'users'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select * from "users" where "votes" > \'100\' and "votes" < \'200\'');
        return done();
      });
    });

    it('should generate a valid query when multiple columns and operators are used', function(done) {
      var tree = analyze({
        select: '*',
        where: {
          votes: { '>': 100 },
          age: { '<': 50 }
        },
        from: 'users'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select * from "users" where "votes" > \'100\' and "age" < \'50\'');
        return done();
      });
    });



  });
});
