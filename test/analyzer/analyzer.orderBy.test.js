var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('ORDER BY statements', function() {
    it('should generate a valid group when ORDER BY is used', function(done) {
      var tokens = tokenize({
        select: '*',
        from: 'users',
        orderBy: [{ name: 'desc' }, { age: 'asc' }]
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
            { type: 'IDENTIFIER', value: 'ORDERBY' },
            { type: 'KEY', value: 'name' },
            { type: 'VALUE', value: 'desc' },
            { type: 'KEY', value: 'age' },
            { type: 'VALUE', value: 'asc' }
          ]
        ]);

        return done();
      });
    });
  });
});
