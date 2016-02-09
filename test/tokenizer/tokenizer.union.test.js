var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('Union ::', function() {
    it('should generate a valid token array for a UNION array', function(done) {
      Tokenizer({
        expression: {
          select: '*',
          from: 'users',
          where: {
            firstName: 'Bob'
          },
          union: [
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
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'firstName' },
          { type: 'VALUE', value: 'Bob' },
          { type: 'ENDIDENTIFIER', value: 'WHERE' },
          { type: 'UNION', value: 'UNION' },
          { type: 'GROUP', value: 0 },
          { type: 'SUBQUERY', value: null },
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'lastName' },
          { type: 'VALUE', value: 'Smith' },
          { type: 'ENDIDENTIFIER', value: 'WHERE' },
          { type: 'ENDSUBQUERY', value: null },
          { type: 'ENDGROUP', value: 0 },
          { type: 'GROUP', value: 1 },
          { type: 'SUBQUERY', value: null },
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'ENDIDENTIFIER', value: 'SELECT' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'ENDIDENTIFIER', value: 'FROM' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'middleName' },
          { type: 'VALUE', value: 'Allen' },
          { type: 'ENDIDENTIFIER', value: 'WHERE' },
          { type: 'ENDSUBQUERY', value: null },
          { type: 'ENDGROUP', value: 1 },
          { type: 'ENDUNION', value: 'UNION' }
        ]);

        return done();
      });
    });
  });
});
