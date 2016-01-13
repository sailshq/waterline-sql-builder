var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('SELECT statements', function() {

    it('should generate a valid token array when "*" is used', function(done) {
      Tokenizer({
        expression: {
          select: '*',
          from: 'books'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.equal(result.length, 4);
        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'books' }
        ]);

        return done();
      });
    });

    it('should generate a valid token array when defined columns are used', function(done) {
      Tokenizer({
        expression: {
          select: ['title', 'author', 'year'],
          from: 'books'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.equal(result.length, 4);
        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: [ 'title', 'author', 'year' ] },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'books' }
        ]);

        return done();
      });
    });

  });
});
