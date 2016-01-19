var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('Various Operators', function() {

    it('should generate a valid token array when LIKE is used', function(done) {
      Tokenizer({
        expression: {
          select: '*',
          from: 'users',
          where: {
            or: [
              {
                name: {
                  like: '%Test%'
                }
              },
              {
                not: {
                  id: {
                    in: [1,2,3]
                  }
                }
              }
            ]
          }
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'CONDITION', value: 'OR' },
          { type: 'GROUP', value: 0 },
          { type: 'KEY', value: 'name' },
          { type: 'OPERATOR', value: 'like' },
          { type: 'VALUE', value: '%Test%' },
          { type: 'ENDGROUP', value: 0 },
          { type: 'GROUP', value: 1 },
          { type: 'CONDITION', value: 'NOT' },
          { type: 'KEY', value: 'id' },
          { type: 'CONDITION', value: 'IN' },
          { type: 'VALUE', value: [ 1, 2, 3 ] },
          { type: 'ENDGROUP', value: 1 },
          { type: 'ENDCONDITION', value: 'OR' }
        ]);

        return done();
      });
    });

  });
});
