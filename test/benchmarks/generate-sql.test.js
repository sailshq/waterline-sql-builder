var runBenchmarks = require('../support/benchmark-runner');
var sqlBuilder = require('../../index')({
  dialect: 'postgres'
});

//  ╔╗ ╔═╗╔╗╔╔═╗╦ ╦╔╦╗╔═╗╦═╗╦╔═╔═╗
//  ╠╩╗║╣ ║║║║  ╠═╣║║║╠═╣╠╦╝╠╩╗╚═╗
//  ╚═╝╚═╝╝╚╝╚═╝╩ ╩╩ ╩╩ ╩╩╚═╩ ╩╚═╝
describe('Benchmark :: Generate SQL', function() {
  // Set "timeout" and "slow" thresholds incredibly high
  // to avoid running into issues.
  this.slow(240000);
  this.timeout(240000);

  it('should be performant enough', function() {
    runBenchmarks('Sequelizer.execSync()', [
      function generateSelect() {
        sqlBuilder.sequelizer({
          select: '*',
          from: 'books'
        });
      },

      function generateInsert() {
        sqlBuilder.sequelizer({
          insert: {
            title: 'Slaughterhouse Five'
          },
          into: 'books'
        });
      },

      function generateUpdate() {
        sqlBuilder.sequelizer({
          update: {
            status: 'archived'
          },
          where: {
            publishedDate: { '>': 2000 }
          },
          using: 'books'
        });
      },

      function generateDestroy() {
        sqlBuilder.sequelizer({
          del: true,
          from: 'accounts',
          where: {
            activated: false
          }
        });
      },
    ]);
  });
});
