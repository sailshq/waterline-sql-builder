var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('Subqueries ::', function() {
    describe('used as a predicate', function() {
      it('should generate a valid token array for an IN subquery', function(done) {
        Tokenizer({
          expression: {
            select: '*',
            from: 'accounts',
            where: {
              id: {
                in: {
                  select: ['id'],
                  from: 'users',
                  where: {
                    or: [
                      { status: 'active' },
                      { name: 'John' }
                    ]
                  }
                }
              }
            }
          }
        })
        .exec(function(err, result) {
          assert(!err);

          assert.deepEqual(result,  [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' },
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'accounts' },
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'KEY', value: 'id' },
            { type: 'CONDITION', value: 'IN' },
            { type: 'SUBQUERY', value: null },
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'id' },
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' },
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'CONDITION', value: 'OR' },
            { type: 'GROUP', value: 0 },
            { type: 'KEY', value: 'status' },
            { type: 'VALUE', value: 'active' },
            { type: 'ENDGROUP', value: 0 },
            { type: 'GROUP', value: 1 },
            { type: 'KEY', value: 'name' },
            { type: 'VALUE', value: 'John' },
            { type: 'ENDGROUP', value: 1 },
            { type: 'ENDCONDITION', value: 'OR' },
            { type: 'ENDSUBQUERY', value: null }
          ]);

          return done();
        });
      });

      it('should generate a valid token array for a NOT IN subquery', function(done) {
        Tokenizer({
          expression: {
            select: '*',
            from: 'accounts',
            where: {
              not: {
                id: {
                  in: {
                    select: ['id'],
                    from: 'users',
                    where: {
                      or: [
                        { status: 'active' },
                        { name: 'John' }
                      ]
                    }
                  }
                }
              }
            }
          }
        })
        .exec(function(err, result) {
          assert(!err);

          assert.deepEqual(result,  [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' },
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'accounts' },
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'CONDITION', value: 'NOT' },
            { type: 'KEY', value: 'id' },
            { type: 'CONDITION', value: 'IN' },
            { type: 'SUBQUERY', value: null },
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'id' },
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' },
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'CONDITION', value: 'OR' },
            { type: 'GROUP', value: 0 },
            { type: 'KEY', value: 'status' },
            { type: 'VALUE', value: 'active' },
            { type: 'ENDGROUP', value: 0 },
            { type: 'GROUP', value: 1 },
            { type: 'KEY', value: 'name' },
            { type: 'VALUE', value: 'John' },
            { type: 'ENDGROUP', value: 1 },
            { type: 'ENDCONDITION', value: 'OR' },
            { type: 'ENDSUBQUERY', value: null }
          ]);

          return done();
        });
      });
    }); // </ predicate >

    describe('used as scalar values', function() {
      it('should generate a valid token array when used inside a SELECT', function(done) {
        Tokenizer({
          expression: {
            select: ['name', {
              select: ['username'],
              from: 'users',
              where: {
                or: [
                  { status: 'active' },
                  { name: 'John' }
                ]
              },
              as: 'username'
            }, 'age'],
            from: 'accounts'
          }
        })
        .exec(function(err, result) {
          assert(!err);

          assert.deepEqual(result,  [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'name' },
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'SUBQUERY', value: null },
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'username' },
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' },
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'CONDITION', value: 'OR' },
            { type: 'GROUP', value: 0 },
            { type: 'KEY', value: 'status' },
            { type: 'VALUE', value: 'active' },
            { type: 'ENDGROUP', value: 0 },
            { type: 'GROUP', value: 1 },
            { type: 'KEY', value: 'name' },
            { type: 'VALUE', value: 'John' },
            { type: 'ENDGROUP', value: 1 },
            { type: 'ENDCONDITION', value: 'OR' },
            { type: 'IDENTIFIER', value: 'AS' },
            { type: 'VALUE', value: 'username' },
            { type: 'ENDSUBQUERY', value: null },
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'age' },
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'accounts' }
          ]);

          return done();
        });
      });

      it('should generate a valid token array when used as a value in a WHERE', function(done) {
        Tokenizer({
          expression: {
            select: ['name', 'age'],
            from: 'accounts',
            where: {
              username: {
                select: ['username'],
                from: 'users',
                where: {
                  color: 'accounts.color'
                }
              }
            }
          }
        })
        .exec(function(err, result) {
          assert(!err);

          assert.deepEqual(result,  [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'name' },
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'age' },
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'accounts' },
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'KEY', value: 'username' },
            { type: 'SUBQUERY', value: null },
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'username' },
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' },
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'KEY', value: 'color' },
            { type: 'VALUE', value: 'accounts.color' },
            { type: 'ENDSUBQUERY', value: null }
          ]);

          return done();
        });
      });
    }); // </ scalar >

    describe('used as table sub query', function() {
      it('should generate a valid token array when used as a value in a FROM with an AS alias', function(done) {
        Tokenizer({
          expression: {
            select: ['name', 'age'],
            from: {
              select: ['age'],
              from: 'users',
              where: {
                age: 21
              },
              as: 'userage'
            }
          }
        })
        .exec(function(err, result) {
          assert(!err);

          assert.deepEqual(result,  [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'name' },
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'age' },
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'SUBQUERY', value: null },
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'age' },
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' },
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'KEY', value: 'age' },
            { type: 'VALUE', value: 21 },
            { type: 'IDENTIFIER', value: 'AS' },
            { type: 'VALUE', value: 'userage' },
            { type: 'ENDSUBQUERY', value: null }
          ]);

          return done();
        });
      });
    }); // </ table >
  });
});
