var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('UPDATE statements', function() {
    it('should generate a valid group for UPDATE statements', function(done) {
      var tokens = tokenize({
        update: {
          status: 'archived'
        },
        where: {
          publishedDate: { '>': 2000 }
        },
        using: 'books'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          [
            { type: 'IDENTIFIER', value: 'UPDATE' },
            { type: 'KEY', value: 'status' },
            { type: 'VALUE', value: 'archived' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'KEY', value: 'publishedDate' },
            { type: 'OPERATOR', value: '>' },
            { type: 'VALUE', value: 2000 }
          ],
          [
            { type: 'IDENTIFIER', value: 'USING' },
            { type: 'VALUE', value: 'books' }
          ]
        ]);

        return done();
      });
    });
  });
});
