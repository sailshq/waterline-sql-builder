var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('WHERE IN statements', function() {

    it('should generate a valid group', function(done) {
      var tokens = tokenize({
        select: ['name'],
        from: 'users',
        where: {
          id: {
            in: [1,2,3]
          }
        }
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'name' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'KEY', value: 'id' },
            { type: 'CONDITION', value: 'IN' },
            { type: 'VALUE', value: [ 1, 2, 3 ] }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when in an OR statement', function(done) {
      var tokens = tokenize({
        select: ['name'],
        from: 'users',
        where: {
          or: [
            {
              id: {
                in: [1,2,3]
              }
            },
            {
              id: {
                in: [4,5,6]
              }
            }
          ]
        }
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'name' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            [
              { type: 'KEY', value: 'id' },
              { type: 'CONDITION', value: 'IN' },
              { type: 'VALUE', value: [ 1, 2, 3 ] }
            ],
            [
              { type: 'KEY', value: 'id' },
              { type: 'CONDITION', value: 'IN' },
              { type: 'VALUE', value: [ 4, 5, 6 ] }
            ]
          ]
        ]);

        return done();
      });
    });

  });
});
