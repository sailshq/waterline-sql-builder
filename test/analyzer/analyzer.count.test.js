var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('COUNT statements', function() {
    it('should generate a valid group when when COUNT is used', function(done) {
      var tokens = tokenize({
        count: [
          'active'
        ],
        from: 'users'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'COUNT' },
            { type: 'VALUE', value: ['active'] }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ]
        ]);

        return done();
      });
    });
  });
});
