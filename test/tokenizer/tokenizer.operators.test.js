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
                    in: [1, 2, 3]
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
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'CONDITION', value: 'OR' },
          { type: 'GROUP', value: 0 },
          { type: 'KEY', value: 'name' },
          { type: 'OPERATOR', value: 'like' },
          { type: 'VALUE', value: '%Test%' },
          { type: 'ENDOPERATOR', value: 'like' },
          { type: 'ENDGROUP', value: 0 },
          { type: 'GROUP', value: 1 },
          { type: 'CONDITION', value: 'NOT' },
          { type: 'KEY', value: 'id' },
          { type: 'CONDITION', value: 'IN' },
          { type: 'VALUE', value: [1, 2, 3] },
          { type: 'ENDCONDITION', value: 'IN' },
          { type: 'ENDGROUP', value: 1 },
          { type: 'ENDCONDITION', value: 'OR' },
          { type: 'ENDIDENTIFIER', value: 'WHERE' }
        ]);

        return done();
      });
    });
  });
});
