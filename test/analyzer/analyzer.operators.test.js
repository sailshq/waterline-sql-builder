var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('Various Operators', function() {

    it('should generate a valid group for LIKE operators', function(done) {
      var tokens = tokenize({
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
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            [
              { type: 'KEY', value: 'name' },
              { type: 'OPERATOR', value: 'like' },
              { type: 'VALUE', value: '%Test%' }
            ],
            [
              { type: 'CONDITION', value: 'NOT' },
              { type: 'KEY', value: 'id' },
              { type: 'CONDITION', value: 'IN' },
              { type: 'VALUE', value: [ 1, 2, 3 ] }
            ]
          ]
        ]);

        return done();
      });
    });

  });
});
