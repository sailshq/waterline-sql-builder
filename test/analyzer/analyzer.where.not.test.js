var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('WHERE NOT statements', function() {
    it('should generate a valid group', function(done) {
      var tokens = tokenize({
        select: ['id'],
        from: 'users',
        where: {
          not: {
            firstName: 'Test',
            lastName: 'User'
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
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: 'id' }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'CONDITION', value: 'NOT' },
            { type: 'KEY', value: 'firstName' },
            { type: 'VALUE', value: 'Test' },
            { type: 'CONDITION', value: 'NOT' },
            { type: 'KEY', value: 'lastName' },
            { type: 'VALUE', value: 'User' }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when nested NOT statements are used', function(done) {
      var tokens = tokenize({
        select: '*',
        from: 'users',
        where: {
          or: [
            {
              not: {
                or: [
                  {
                    id: 1
                  },
                  {
                    not: {
                      id: {
                        '>': 10
                      }
                    }
                  }
                ]
              }
            },
            {
              not: {
                name: 'Tester'
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
              { type: 'CONDITION', value: 'NOT' },
              [
                { type: 'KEY', value: 'id' },
                { type: 'VALUE', value: 1 }
              ],
              [
                { type: 'CONDITION', value: 'NOT' },
                { type: 'KEY', value: 'id' },
                { type: 'OPERATOR', value: '>' },
                { type: 'VALUE', value: 10 }
              ]
            ],
            [
              { type: 'CONDITION', value: 'NOT' },
              { type: 'KEY', value: 'name' },
              { type: 'VALUE', value: 'Tester' }
            ]
          ]
        ]);


        return done();
      });
    });

    it('should generate a valid group when conditionals are used', function(done) {
      var tokens = tokenize({
        select: '*',
        from: 'users',
        where: {
          not: {
            votes: { '>': 100 }
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
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'WHERE' },
            { type: 'CONDITION', value: 'NOT' },
            { type: 'KEY', value: 'votes' },
            { type: 'OPERATOR', value: '>' },
            { type: 'VALUE', value: 100 }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when multiple conditionals are used', function(done) {
      var tokens = tokenize({
        select: '*',
        from: 'users',
        where: {
          or: [
            { name: 'John' },
            {
              votes: { '>': 100 },
              not: {
                title: 'Admin'
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
              { type: 'VALUE', value: 'John' }
            ],
            [
              { type: 'KEY', value: 'votes' },
              { type: 'OPERATOR', value: '>' },
              { type: 'VALUE', value: 100 },
              { type: 'CONDITION', value: 'NOT' },
              { type: 'KEY', value: 'title' },
              { type: 'VALUE', value: 'Admin' }
            ]
          ]
        ]);

        return done();
      });
    });
  });
});
