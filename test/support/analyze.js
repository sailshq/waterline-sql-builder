/**
 * Given a criteria format, return the analyzed version.
 * For use with Sequelizer tests.
 */

var Parser = require('waterline-query-parser');

module.exports = function(expression) {
  var tokens = Parser.tokenizer({
    expression: expression
  }).execSync();

  var tree = Parser.analyzer({
    tokens: tokens
  }).execSync();

  return tree;
};
