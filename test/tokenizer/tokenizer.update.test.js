var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('UPDATE statements', function() {

    it('should generate a valid token array for an UPDATE is used', function(done) {
      Tokenizer({
        expression: {
          update: {
            status: 'archived'
          },
          where: {
            publishedDate: { '>': 2000 }
          },
          using: 'books'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'UPDATE' },
          { type: 'KEY', value: 'status' },
          { type: 'VALUE', value: 'archived' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'publishedDate' },
          { type: 'OPERATOR', value: '>' },
          { type: 'VALUE', value: 2000 },
          { type: 'IDENTIFIER', value: 'USING' },
          { type: 'VALUE', value: 'books' }
        ]);

        return done();
      });
    });

  });
});
