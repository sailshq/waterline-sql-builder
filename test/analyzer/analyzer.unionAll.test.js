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
            { type: 'UNION', value: 'UNIONALL' },
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

    it('should generate a valid group with joins inside UNIONALL statements', function(done) {
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
            },
            join: [
              {
                from: 'books',
                on: {
                  books: 'book_id',
                  users: 'id'
                }
              }
            ]
          },
          {
            select: '*',
            from: 'users',
            where: {
              middleName: 'Allen'
            },
            join: [
              {
                from: 'books',
                on: {
                  books: 'book_id',
                  users: 'id'
                }
              }
            ]
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
            { type: 'UNION', value: 'UNIONALL' },
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
                ],
                [
                  { type: 'IDENTIFIER', value: 'JOIN' },
                  [
                    { type: 'KEY', value: 'TABLE' },
                    { type: 'VALUE', value: 'books' },
                    { type: 'KEY', value: 'TABLE_KEY' },
                    { type: 'VALUE', value: 'books' },
                    { type: 'KEY', value: 'COLUMN_KEY' },
                    { type: 'VALUE', value: 'book_id' },
                    { type: 'KEY', value: 'TABLE_KEY' },
                    { type: 'VALUE', value: 'users' },
                    { type: 'KEY', value: 'COLUMN_KEY' },
                    { type: 'VALUE', value: 'id' }
                  ]
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
                ],
                [
                  { type: 'IDENTIFIER', value: 'JOIN' },
                  [
                    { type: 'KEY', value: 'TABLE' },
                    { type: 'VALUE', value: 'books' },
                    { type: 'KEY', value: 'TABLE_KEY' },
                    { type: 'VALUE', value: 'books' },
                    { type: 'KEY', value: 'COLUMN_KEY' },
                    { type: 'VALUE', value: 'book_id' },
                    { type: 'KEY', value: 'TABLE_KEY' },
                    { type: 'VALUE', value: 'users' },
                    { type: 'KEY', value: 'COLUMN_KEY' },
                    { type: 'VALUE', value: 'id' }
                  ]
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
