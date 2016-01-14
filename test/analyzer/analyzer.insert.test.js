var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('INSERT statements', function() {

    it('should generate a valid group for INSERT statements', function(done) {
      var tokens = tokenize({
        insert: {
          title: 'Slaughterhouse Five'
        },
        into: 'books'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          [
            { type: 'IDENTIFIER', value: 'INTO' },
            { type: 'VALUE', value: 'books' }
          ],
          [
            { type: 'IDENTIFIER', value: 'INSERT' },
            { type: 'KEY', value: 'title' },
            { type: 'VALUE', value: 'Slaughterhouse Five' }
          ]
        ]);

        return done();
      });
    });

  });
});
