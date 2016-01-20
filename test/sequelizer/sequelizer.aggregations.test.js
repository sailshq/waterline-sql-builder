var Sequelizer = require('../../index').sequelizer;
var analyze = require('../support/analyze');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('Aggregations', function() {

    it('should generate a group by query', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        groupBy: ['count']
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select * from "users" group by "count"');
        return done();
      });
    });

    it('should generate a MIN query', function(done) {
      var tree = analyze({
        min: [
          'active'
        ],
        from: 'users'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select min("active") from "users"');
        return done();
      });
    });

    it('should generate a MAX query', function(done) {
      var tree = analyze({
        max: [
          'active'
        ],
        from: 'users'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select max("active") from "users"');
        return done();
      });
    });

    it('should generate a SUM query', function(done) {
      var tree = analyze({
        sum: [
          'active'
        ],
        from: 'users'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select sum("active") from "users"');
        return done();
      });
    });

    it('should generate a AVG query', function(done) {
      var tree = analyze({
        avg: [
          'active'
        ],
        from: 'users'
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result, 'select avg("active") from "users"');
        return done();
      });
    });

  });
});
