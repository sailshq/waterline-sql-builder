var Analyzer = require('../../index').analyzer;
var tokenize = require('../support/tokenize');
var assert = require('assert');

describe('Analyzer ::', function() {
  describe('Aggregations', function() {
    it('should generate a valid group when when GROUP BY is used', function(done) {
      var tokens = tokenize({
        select: '*',
        from: 'users',
        groupBy: ['count']
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'SELECT' },
            { type: 'VALUE', value: '*' }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ],
          [
            { type: 'IDENTIFIER', value: 'GROUPBY' },
            { type: 'VALUE', value: ['count'] }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when when MIN is used', function(done) {
      var tokens = tokenize({
        min: [
          'active'
        ],
        from: 'users'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'MIN' },
            { type: 'VALUE', value: ['active'] }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when when MAX is used', function(done) {
      var tokens = tokenize({
        max: [
          'active'
        ],
        from: 'users'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'MAX' },
            { type: 'VALUE', value: ['active'] }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when when SUM is used', function(done) {
      var tokens = tokenize({
        sum: [
          'active'
        ],
        from: 'users'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'SUM' },
            { type: 'VALUE', value: ['active'] }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ]
        ]);

        return done();
      });
    });

    it('should generate a valid group when when AVG is used', function(done) {
      var tokens = tokenize({
        avg: [
          'active'
        ],
        from: 'users'
      });

      Analyzer({
        tokens: tokens
      })
      .exec(function(err, result) {
        assert(!err);

        assert.deepEqual(result,  [
          [
            { type: 'IDENTIFIER', value: 'AVG' },
            { type: 'VALUE', value: ['active'] }
          ],
          [
            { type: 'IDENTIFIER', value: 'FROM' },
            { type: 'VALUE', value: 'users' }
          ]
        ]);

        return done();
      });
    });
  });
});
