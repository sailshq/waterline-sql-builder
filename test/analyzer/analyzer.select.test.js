var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('SELECT statements', function() {

    it('should generate a valid group for select "*"', function(done) {
      var tokens = tokenize({
        select: '*',
        from: 'books'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.equal(result.length, 2);
        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'books' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group for select when defined columns are used', function(done) {
      var tokens = tokenize({
        select: ['title', 'author', 'year'],
        from: 'books'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.equal(result.length, 2);
        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'books' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: ['title', 'author', 'year'] }
          ]
        ]);

        return done();
      });
    });

  });
});
