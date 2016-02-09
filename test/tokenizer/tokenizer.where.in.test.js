var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('WHERE IN statements', function() {
    it('should generate a valid token array', function(done) {
      Tokenizer({
        expression: {
          select: ['name'],
          from: 'users',
          where: {
            id: {
              in: [1, 2, 3]
            }
          }
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: 'name' },
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'id' },
          { type: 'CONDITION', value: 'IN' },
          { type: 'VALUE', value: [1, 2, 3] },
          { type: 'ENDCONDITION', value: 'IN' },
          { type: 'ENDIDENTIFIER', value: 'WHERE' }
        ]);

        return done();
      });
    });

    it('should generate a valid token array when in an OR statement', function(done) {
      Tokenizer({
        expression: {
          select: ['name'],
          from: 'users',
          where: {
            or: [
              {
                id: {
                  in: [1, 2, 3]
                }
              },
              {
                id: {
                  in: [4, 5, 6]
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
          { type: 'VALUE', value: 'name' },
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'CONDITION', value: 'OR' },
          { type: 'GROUP', value: 0 },
          { type: 'KEY', value: 'id' },
          { type: 'CONDITION', value: 'IN' },
          { type: 'VALUE', value: [1, 2, 3] },
          { type: 'ENDCONDITION', value: 'IN' },
          { type: 'ENDGROUP', value: 0 },
          { type: 'GROUP', value: 1 },
          { type: 'KEY', value: 'id' },
          { type: 'CONDITION', value: 'IN' },
          { type: 'VALUE', value: [4, 5, 6] },
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
