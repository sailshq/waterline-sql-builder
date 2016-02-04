var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('DELETE statements', function() {
    it('should generate a valid token array for an DELETE is used', function(done) {
      Tokenizer({
        expression: {
          del: true,
          from: 'accounts',
          where: {
            activated: false
          }
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'DELETE' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'accounts' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'activated' },
          { type: 'VALUE', value: false }
        ]);

        return done();
      });
    });
  });
});
