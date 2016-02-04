var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('OFFSET statements', function() {
    it('should generate a valid group when OFFSET is used', function(done) {
      var tokens = tokenize({
        select: '*',
        from: 'users',
        offset: 10
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
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'OFFSET' },
            { type: 'VALUE', value: 10 }
          ]
        ]);

        return done();
      });
    });
  });
});
