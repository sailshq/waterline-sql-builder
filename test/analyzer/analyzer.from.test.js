var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('FROM statements', function() {
    it('should generate a valid group when FROM is used', function(done) {
      var tokens = tokenize({
        select: '*',
        from: 'books'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'books' }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group for select when FROM is used with a SCHEMA', function(done) {
      var tokens = tokenize({
        select: ['title', 'author', 'year'],
        from: { table: 'books', schema: 'foo' }
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'title' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'author' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'year' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SCHEMA' },
            { type: 'VALUE', value: 'foo' }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'books' }
          ]
        ]);

        return done();
      });
    });
  });
});
