/**
 * Given a criteria format, return the analyzed version.
 * For use with Sequelizer tests.
 */

var Parser = require('waterline-query-parser');

module.exports = function(expression) {
  var tokens = Parser.tokenizer(expression);
  var tree = Parser.analyzer(tokens);
  return tree;
};
