var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('COUNT statements', function() {

    it('should generate a valid token array when COUNT is used', function(done) {
      Tokenizer({
        expression: {
          count: [
            'active'
          ],
          from: 'users'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'COUNT' },
          { type: 'VALUE', value: [ 'active' ] },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' }
        ]);

        return done();
      });
    });

  });
});
