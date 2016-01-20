var Tokenizer = require('../../index').tokenizer;
var assert = require('assert');

describe('Tokenizer ::', function() {
  describe('JOINS ::', function() {

    it('should generate a valid token array when a JOIN operation is used', function(done) {
      Tokenizer({
        expression: {
          select: ['users.id', 'contacts.phone'],
          from: 'users',
          join: [
            {
              from: 'contacts',
              on: {
                users: 'id',
                contacts: 'user_id'
              }
            }
          ]
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: [ 'users.id', 'contacts.phone' ] },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'IDENTIFIER', value: 'JOIN' },
          { type: 'KEY', value: 'TABLE' },
          { type: 'VALUE', value: 'contacts' },
          { type: 'KEY', value: 'TABLE_KEY' },
          { type: 'VALUE', value: 'users' },
          { type: 'KEY', value: 'COLUMN_KEY' },
          { type: 'VALUE', value: 'id' },
          { type: 'KEY', value: 'TABLE_KEY' },
          { type: 'VALUE', value: 'contacts' },
          { type: 'KEY', value: 'COLUMN_KEY' },
          { type: 'VALUE', value: 'user_id' }
        ]);

        return done();
      });
    });

    it('should generate a valid token array when an INNERJOIN operation is used', function(done) {
      Tokenizer({
        expression: {
          select: ['users.id', 'contacts.phone'],
          from: 'users',
          innerJoin: [
            {
              from: 'contacts',
              on: {
                users: 'id',
                contacts: 'user_id'
              }
            }
          ]
        }
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result, [
          { type: 'IDENTIFIER', value: 'SELECT' },
          { type: 'VALUE', value: [ 'users.id', 'contacts.phone' ] },
          { type: 'IDENTIFIER', value: 'FROM' },
          { type: 'VALUE', value: 'users' },
          { type: 'IDENTIFIER', value: 'INNERJOIN' },
          { type: 'KEY', value: 'TABLE' },
          { type: 'VALUE', value: 'contacts' },
          { type: 'KEY', value: 'TABLE_KEY' },
          { type: 'VALUE', value: 'users' },
          { type: 'KEY', value: 'COLUMN_KEY' },
          { type: 'VALUE', value: 'id' },
          { type: 'KEY', value: 'TABLE_KEY' },
          { type: 'VALUE', value: 'contacts' },
          { type: 'KEY', value: 'COLUMN_KEY' },
          { type: 'VALUE', value: 'user_id' }
        ]);

        return done();
      });
    });


  });
});
