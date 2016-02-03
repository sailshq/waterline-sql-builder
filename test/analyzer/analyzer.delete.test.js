var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('DELETE statements', function() {

    it.only('should generate a valid group for DELETE statements', function(done) {
      var tokens = tokenize({
        del: true,
        from: 'accounts',
        where: {
          activated: false
        }
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          [
            { type: 'IDENTIFIER', value: 'DELETE' }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'accounts' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'KEY', value: 'activated' },
            { type: 'VALUE', value: false }
          ]
        ]);

        return done();
      });
    });

  });
});
