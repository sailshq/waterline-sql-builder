var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('ORDER BY statements', function() {

    it('should generate a valid token array when ORDER BY is used', function(done) {
      Tokenizer({
        expression: {
          select: '*',
          from: 'users',
          orderBy: [{ name: 'desc' }]
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'IDENTIFIER', value: 'ORDERBY' },
          { type: 'KEY', value: 'name' },
          { type: 'VALUE', value: 'desc' }
        ]);

        return done();
      });
    });

  });
});
