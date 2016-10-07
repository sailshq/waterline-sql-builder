//  ██╗    ██╗ █████╗ ████████╗███████╗██████╗ ██╗     ██╗███╗   ██╗███████╗
//  ██║    ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗██║     ██║████╗  ██║██╔════╝
//  ██║ █╗ ██║███████║   ██║   █████╗  ██████╔╝██║     ██║██╔██╗ ██║█████╗
//  ██║███╗██║██╔══██║   ██║   ██╔══╝  ██╔══██╗██║     ██║██║╚██╗██║██╔══╝
//  ╚███╔███╔╝██║  ██║   ██║   ███████╗██║  ██║███████╗██║██║ ╚████║███████╗
//   ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
//
//  ███████╗ ██████╗ ██╗         ██████╗ ██╗   ██╗██╗██╗     ██████╗ ███████╗██████╗
//  ██╔════╝██╔═══██╗██║         ██╔══██╗██║   ██║██║██║     ██╔══██╗██╔════╝██╔══██╗
//  ███████╗██║   ██║██║         ██████╔╝██║   ██║██║██║     ██║  ██║█████╗  ██████╔╝
//  ╚════██║██║▄▄ ██║██║         ██╔══██╗██║   ██║██║██║     ██║  ██║██╔══╝  ██╔══██╗
//  ███████║╚██████╔╝███████╗    ██████╔╝╚██████╔╝██║███████╗██████╔╝███████╗██║  ██║
//  ╚══════╝ ╚══▀▀═╝ ╚══════╝    ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝
//
// Use Waterline Statements to generate a SQL query that can be used in one of
// the many supported drivers or run independently.

var Knex = require('knex');
var Parser = require('waterline-query-parser');
var Sequelizer = require('./machines/sequelizer');

module.exports = function sqlBuilder(options) {
  if (!options.dialect) {
    throw new Error('Missing Dialect!');
  }

  // Build up a Knex instance to use in the query builder
  var knexInstance = Knex({
    dialect: options.dialect,
    useNullAsDefault: true
  });


  return {

    //  ╔═╗╔═╗╔╗╔╔═╗╦═╗╔═╗╔╦╗╔═╗╦═╗
    //  ║ ╦║╣ ║║║║╣ ╠╦╝╠═╣ ║ ║ ║╠╦╝
    //  ╚═╝╚═╝╝╚╝╚═╝╩╚═╩ ╩ ╩ ╚═╝╩╚═
    // This the main function used by the adapters. Given a Statement, use the
    // query parser to generate a token tree and then build up a SQL string.
    generate: function generate(query) {
      // Tokenize the values
      var tokens = Parser.tokenizer({
        expression: query
      }).execSync();

      // Analyze the tokens
      var tree = Parser.analyzer({
        tokens: tokens
      }).execSync();

      // Generate the SQL
      var sql = Sequelizer({
        knex: knexInstance,
        tree: tree
      }).execSync();

      return sql;
    },

    //  ╔═╗╔═╗╔═╗ ╦ ╦╔═╗╦  ╦╔═╗╔═╗╦═╗
    //  ╚═╗║╣ ║═╬╗║ ║║╣ ║  ║╔═╝║╣ ╠╦╝
    //  ╚═╝╚═╝╚═╝╚╚═╝╚═╝╩═╝╩╚═╝╚═╝╩╚═
    // Given a token tree from the query parser, build up a SQL string.
    sequelizer: function sequelizer(tree) {
      return Sequelizer({
        knex: knexInstance,
        tree: tree
      }).execSync();
    }
  };
};
