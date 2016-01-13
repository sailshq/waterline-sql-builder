/**
 * Given a criteria format, return the analyzed version.
 * For use with Sequelizer tests.
 */

var Tokenizer = require('../../index').tokenizer;
var Analyzer = require('../../index').analyzer;

module.exports = function(expression) {
  var tokens = Tokenizer({
    expression: expression
  }).execSync();

  var tree = Analyzer({
    tokens: tokens
  }).execSync();

  return tree;
};
