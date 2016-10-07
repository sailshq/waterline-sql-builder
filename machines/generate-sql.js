module.exports = {


  friendlyName: 'Generate SQL',


  description: 'Generates a SQL string from an expression',


  cacheable: true,


  sync: true,


  inputs: {

    dialect: {
      description: 'The SQL dialect to generate a query for.',
      example: 'postgresql'
    },

    query: {
      description: 'The query to parse.',
      example: {},
      required: true
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'The generated SQL statement.',
      example: '==='
      // example: {
      //   sql: 'select * from "books"',
      //   bindings: ['===']
      // }
    }

  },


  fn: function generateSql(inputs, exits) {
    var Pack = require('../index');
    var Parser = require('waterline-query-parser');

    // Tokenize the values
    var tokens = Parser.tokenizer({
      expression: inputs.query
    }).execSync();

    // Analyze the tokens
    var tree = Parser.analyzer({
      tokens: tokens
    }).execSync();

    // Generate the SQL
    var sql = Pack.sequelizer({
      dialect: inputs.dialect,
      tree: tree
    }).execSync();

    return exits.success(sql);
  }

};
