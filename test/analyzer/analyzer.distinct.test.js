var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('DISTINCT statements', function() {

    it('should generate a valid group when when DISTINCT is used', function(done) {
      var tokens = tokenize({
        select: {
          distinct: ['firstName', 'lastName']
        },
        from: 'customers'
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
            { type: 'VALUE', value: 'customers' }
          ],
          [
            { type: 'IDENTIFIER', value: 'DISTINCT' },
            { type: 'VALUE', value: ['firstName', 'lastName'] }
          ]
        ]);

        return done();
      });
    });

  });
});
