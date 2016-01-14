var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('INSERT statements', function() {

    it('should generate a valid token array for an INSERT is used', function(done) {
      Tokenizer({
        expression: {
          insert: {
            title: 'Slaughterhouse Five'
          },
          into: 'books'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'INSERT' },
          { type: 'KEY', value: 'title' },
          { type: 'VALUE', value: 'Slaughterhouse Five' },
          { type: 'IDENTIFIER', value: 'INTO' },
          { type: 'VALUE', value: 'books' }
        ]);

        return done();
      });
    });

  });
});
