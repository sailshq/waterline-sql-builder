var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('Aggregations', function() {

    it('should generate a valid group when when GROUP BY is used', function(done) {
      var tokens = tokenize({
        select: '*',
        from: 'users',
        groupBy: ['count']
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' }
          ],
          [
            { type: 'IDENTIFIER', value: 'GROUPBY' },
            { type: 'VALUE', value: ['count'] }
          ]
        ]);

        return done();
      });
    });

  });
});
