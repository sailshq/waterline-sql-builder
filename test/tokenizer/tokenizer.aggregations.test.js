var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('Aggregations', function() {

    it('should generate a valid token array for GROUP BY', function(done) {
      Tokenizer({
        expression: {
          select: '*',
          from: 'users',
          groupBy: ['count']
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'IDENTIFIER', value: 'GROUPBY' },
          { type: 'VALUE', value: [ 'count' ] }
        ]);

        return done();
      });
    });

  });
});
