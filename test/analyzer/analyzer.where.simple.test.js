var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('Simple WHERE statements', function() {

    it('should generate a valid group', function(done) {
      var tokens = tokenize({
        select: ['id'],
        where: {
          firstName: 'Test',
          lastName: 'User'
        },
        from: 'users'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'id' },
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'KEY', value: 'firstName' },
            { type: 'VALUE', value: 'Test' },
            { type: 'KEY', value: 'lastName' },
            { type: 'VALUE', value: 'User' }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when used with operators', function(done) {
      var tokens = tokenize({
        select: '*',
        where: {
          votes: { '>': 100 }
        },
        from: 'users'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'KEY', value: 'votes' },
            { type: 'OPERATOR', value: '>' },
            { type: 'VALUE', value: 100 }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when used with multiple operators', function(done) {
      var tokens = tokenize({
        select: '*',
        where: {
          votes: { '>': 100, '<': 200 }
        },
        from: 'users'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'KEY', value: 'votes' },
            { type: 'OPERATOR', value: '>' },
            { type: 'VALUE', value: 100 },
            { type: 'KEY', value: 'votes' },
            { type: 'OPERATOR', value: '<' },
            { type: 'VALUE', value: 200 }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when used with multiple columns and operators', function(done) {
      var tokens = tokenize({
        select: '*',
        where: {
          votes: { '>': 100 },
          age: { '<': 50 }
        },
        from: 'users'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'KEY', value: 'votes' },
            { type: 'OPERATOR', value: '>' },
            { type: 'VALUE', value: 100 },
            { type: 'KEY', value: 'age' },
            { type: 'OPERATOR', value: '<' },
            { type: 'VALUE', value: 50 }
          ]
        ]);

        return done();
      });
    });

  });
});
