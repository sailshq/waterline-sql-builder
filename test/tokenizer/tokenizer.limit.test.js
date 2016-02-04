var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('LIMIT statements', function() {
    it('should generate a valid token array when LIMIT is used', function(done) {
      Tokenizer({
        expression: {
          select: '*',
          from: 'users',
          limit: 10
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'IDENTIFIER', value: 'LIMIT' },
          { type: 'VALUE', value: 10 }
        ]);

        return done();
      });
    });
  });
});
