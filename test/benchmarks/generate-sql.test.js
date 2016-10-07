var runBenchmarks = require('../support/benchmark-runner');
var generator = require('../../index').generateSql;

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
        generator({
          dialect: 'postgres',
          query: {
            select: '*',
            from: 'books'
          }
        }).execSync();
      },

      function generateInsert() {
        generator({
          dialect: 'postgres',
          query: {
            insert: {
              title: 'Slaughterhouse Five'
            },
            into: 'books'
          }
        }).execSync();
      },

      function generateUpdate() {
        generator({
          dialect: 'postgres',
          query: {
            update: {
              status: 'archived'
            },
            where: {
              publishedDate: { '>': 2000 }
            },
            using: 'books'
          }
        }).execSync();
      },

      function generateDestroy() {
        generator({
          dialect: 'postgres',
          query: {
            del: true,
            from: 'accounts',
            where: {
              activated: false
            }
          }
        }).execSync();
      },
    ]);
  });
});
