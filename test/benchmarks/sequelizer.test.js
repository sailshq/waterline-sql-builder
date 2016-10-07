var runBenchmarks = require('../support/benchmark-runner');
var analyze = require('../support/analyze');
var Sequelizer = require('../../index').sequelizer;

//  ╔╗ ╔═╗╔╗╔╔═╗╦ ╦╔╦╗╔═╗╦═╗╦╔═╔═╗
//  ╠╩╗║╣ ║║║║  ╠═╣║║║╠═╣╠╦╝╠╩╗╚═╗
//  ╚═╝╚═╝╝╚╝╚═╝╩ ╩╩ ╩╩ ╩╩╚═╩ ╩╚═╝
describe('Benchmark :: Sequelizer', function() {
  // Set "timeout" and "slow" thresholds incredibly high
  // to avoid running into issues.
  this.slow(240000);
  this.timeout(240000);

  var trees = {};

  // Analyzer all the test inputs before running benchmarks
  before(function() {
    trees.select = analyze({
      select: ['*'],
      from: 'books'
    });

    trees.insert = analyze({
      insert: {
        title: 'Slaughterhouse Five'
      },
      into: 'books'
    });

    trees.update = analyze({
      update: {
        status: 'archived'
      },
      where: {
        publishedDate: { '>': 2000 }
      },
      using: 'books'
    });

    trees.delete = analyze({
      del: true,
      from: 'accounts',
      where: {
        activated: false
      }
    });
  });

  it('should be performant enough', function() {
    runBenchmarks('Sequelizer.execSync()', [
      function sequelizerSelect() {
        Sequelizer({
          dialect: 'postgresql',
          tree: trees.select
        }).execSync();
      },

      function sequelizerInsert() {
        Sequelizer({
          dialect: 'postgresql',
          tree: trees.insert
        }).execSync();
      },

      function sequelizerUpdate() {
        Sequelizer({
          dialect: 'postgresql',
          tree: trees.update
        }).execSync();
      },

      function sequelizerDelete() {
        Sequelizer({
          dialect: 'postgresql',
          tree: trees.delete
        }).execSync();
      }
    ]);
  });
});
