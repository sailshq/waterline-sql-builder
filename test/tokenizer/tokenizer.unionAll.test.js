var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('Union All ::', function() {
    it('should generate a valid token array for a UNIONALL array', function(done) {
      Tokenizer({
        expression: {
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
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'firstName' },
          { type: 'VALUE', value: 'Bob' },
          { type: 'IDENTIFIER', value: 'UNIONALL' },
          { type: 'GROUP', value: 0 },
          { type: 'SUBQUERY', value: null },
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'lastName' },
          { type: 'VALUE', value: 'Smith' },
          { type: 'ENDSUBQUERY', value: null },
          { type: 'ENDGROUP', value: 0 },
          { type: 'GROUP', value: 1 },
          { type: 'SUBQUERY', value: null },
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: '*' },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'IDENTIFIER', value: 'WHERE' },
          { type: 'KEY', value: 'middleName' },
          { type: 'VALUE', value: 'Allen' },
          { type: 'ENDSUBQUERY', value: null },
          { type: 'ENDGROUP', value: 1 }
        ]);

        return done();
      });
    });
  });
});
