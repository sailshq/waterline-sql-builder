var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('DISTINCT statements', function() {

    it('should generate a valid token array when DISTINCT is used', function(done) {
      Tokenizer({
        expression: {
          select: {
            distinct: ['firstName', 'lastName']
          },
          from: 'customers'
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.equal(result.length, 4);
        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'DISTINCT' },
          { type: 'VALUE', value: [ 'firstName', 'lastName' ] },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'customers' }
        ]);

        return done();
      });
    });

  });
});
