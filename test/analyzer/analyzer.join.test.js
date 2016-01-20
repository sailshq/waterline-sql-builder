var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('JOINS', function() {

    it('should generate a valid group when JOIN is used', function(done) {
      var tokens = tokenize({
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
            { type: 'VALUE', value: ['users.id', 'contacts.phone'] }
          ],
          [
            { type: 'IDENTIFIER', value: 'JOIN' },
            [
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
            ]
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when multiple JOINs are used', function(done) {
      var tokens = tokenize({
        select: ['users.id', 'contacts.phone'],
        from: 'users',
        join: [
          {
            from: 'contacts',
            on: {
              users: 'id',
              contacts: 'user_id'
            }
          },
          {
            from: 'carriers',
            on: {
              users: 'id',
              carriers: 'user_id'
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
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: ['users.id', 'contacts.phone'] }
          ],
          [
            { type: 'IDENTIFIER', value: 'JOIN' },
            [
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
            ],
            [
              { type: 'KEY', value: 'TABLE' },
              { type: 'VALUE', value: 'carriers' },
              { type: 'KEY', value: 'TABLE_KEY' },
              { type: 'VALUE', value: 'users' },
              { type: 'KEY', value: 'COLUMN_KEY' },
              { type: 'VALUE', value: 'id' },
              { type: 'KEY', value: 'TABLE_KEY' },
              { type: 'VALUE', value: 'carriers' },
              { type: 'KEY', value: 'COLUMN_KEY' },
              { type: 'VALUE', value: 'user_id' }
            ]
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when INNERJOIN', function(done) {
      var tokens = tokenize({
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
            { type: 'VALUE', value: ['users.id', 'contacts.phone'] }
          ],
          [
            { type: 'IDENTIFIER', value: 'INNERJOIN' },
            [
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
            ]
          ]
        ]);

        return done();
      });
    });

  });
});
