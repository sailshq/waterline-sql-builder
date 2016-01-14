var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('Grouping statements with OR', function() {

    it('should generate a valid group', function(done) {
      var tokens = tokenize({
        select: '*',
        where: {
          or: [
            {
              id: { '>': 10 }
            },
            {
              name: 'Tester'
            }
          ]
        },
        from: 'users'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            [
              { type: 'KEY', value: 'id' },
              { type: 'OPERATOR', value: '>' },
              { type: 'VALUE', value: 10 }
            ],
            [
              { type: 'KEY', value: 'name' },
              { type: 'VALUE', value: 'Tester' }
            ]
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when using nested OR conditions', function(done) {
      var tokens = tokenize({
        select: '*',
        where: {
          or: [
            {
              or: [
                { id: 1 },
                { id: { '>': 10 } }
              ]
            },
            {
              name: 'Tester'
            }
          ]
        },
        from: 'users'
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
            { type: 'VALUE', value: '*' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            [
              [
                { type: 'KEY', value: 'id' },
                { type: 'VALUE', value: 1 }
              ],
              [
                { type: 'KEY', value: 'id' },
                { type: 'OPERATOR', value: '>' },
                { type: 'VALUE', value: 10 }
              ]
            ],
            [
              { type: 'KEY', value: 'name' },
              { type: 'VALUE', value: 'Tester' }
            ]
          ]
        ]);

        return done();
      });
    });

  });
});
