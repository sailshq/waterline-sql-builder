var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('UNION ALL statements', function() {
    it('should generate a valid group for UNIONALL statements', function(done) {
      var tokens = tokenize({
        select: '*',
        from: 'users',
        where: {
          firstName: 'Bob'
        },
        unionAll: [
          {
            select: '*',
            from: 'users',
            where: {
              lastName: 'Smith'
            }
          },
          {
            select: '*',
            from: 'users',
            where: {
              middleName: 'Allen'
            }
          }
        ]
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
            { type: 'KEY', value: 'firstName' },
            { type: 'VALUE', value: 'Bob' }
          ],
          [
            { type: 'IDENTIFIER', value: 'UNIONALL' },
            [
              [
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
                  { type: 'KEY', value: 'lastName' },
                  { type: 'VALUE', value: 'Smith' }
                ]
              ],
              [
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
                  { type: 'KEY', value: 'middleName' },
                  { type: 'VALUE', value: 'Allen' }
                ]
              ]
            ]
          ]
        ]);

        return done();
      });
    });
  });
});
