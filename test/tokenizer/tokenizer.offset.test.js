var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('OFFSET statements', function() {
    it('should generate a valid token array when OFFSET is used', function(done) {
      Tokenizer({
        expression: {
          select: '*',
          from: 'users',
          offset: 10
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' },
          { type: 'IDENTIFIER', value: 'OFFSET' },
          { type: 'VALUE', value: 10 },
          { type: 'ENDIDENTIFIER', value: 'OFFSET' }
        ]);

        return done();
      });
    });
  });
});
