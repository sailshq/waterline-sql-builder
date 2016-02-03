var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('Subqueries', function() {

    describe('used as a predicate', function() {

      it('should generate a valid group for an IN subquery', function(done) {
        var tokens = tokenize({
          select: '*',
          where: {
            id: {
              in: {
                select: ['id'],
                from: 'users',
                where: {
                  or: [
                    { status: 'active' },
                    { name: 'John' }
                  ]
                }
              }
            }
          },
          from: 'accounts',
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
              { type: 'IDENTIFIER', value: 'WHERE' },
              { type: 'KEY', value: 'id' },
              { type: 'CONDITION', value: 'IN' },
              { type: 'SUBQUERY', value: null },
              [
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
                  [
                    { type: 'KEY', value: 'status' },
                    { type: 'VALUE', value: 'active' }
                  ],
                  [
                    { type: 'KEY', value: 'name' },
                    { type: 'VALUE', value: 'John' }
                  ]
                ]
              ]
            ],
            [
              { type: 'IDENTIFIER', value: 'FROM' },
              { type: 'VALUE', value: 'accounts' }
            ]
          ]);

          return done();
        });
      });

      it.skip('should generate a valid group for a NOT IN subquery', function(done) {

      });

    });

    describe('used as scalar values', function() {

      it.skip('should generate a valid group when used inside a SELECT', function(done) {

      });

      it.skip('should generate a valid group when used as a value in a WHERE', function(done) {

      });

    });

    describe('used as table sub query', function() {

      it.skip('should generate a valid group when used as a value in a FROM', function(done) {

      });

      it.skip('should generate a valid group when used as a value in a FROM with an AS alias', function(done) {

      });

    });

  });
});
