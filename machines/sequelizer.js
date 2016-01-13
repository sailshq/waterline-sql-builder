module.exports = {


  friendlyName: 'Sequelizer',


  description: 'Uses Knex to generate sequel for the tree',


  cacheable: true,


  sync: true,


  inputs: {

    dialect: {
      description: 'The SQL dialect to use when generating the query',
      example: 'postgresql',
      defaultsTo: 'postgresql'
    },

    tree: {
      description: 'A tokenized tree representing the query values.',
      example: [[]],
      required: true
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'A SQL string generated from the tree.',
      example: 'select * from "books"'
    },

  },


  fn: function(inputs, exits) {

    var _ = require('lodash');
    var knex = require('knex')({ dialect: inputs.dialect });
    var tree = inputs.tree;
    var query = knex.queryBuilder();

    // Loop through each token group in the tree and add to the query
    _.forEach(tree, function(tokenGroup, key) {
      var identifier;

      // Loop through each item in the group and build up the expression
      _.each(tokenGroup, function(expr) {

        // Handle identifiers by storing them on the fn
        if(expr.type === 'IDENTIFIER') {
          identifier = expr.value;
          return;
        }

        // Process value and use the appropriate Knex function
        if(expr.type === 'VALUE') {

          // Examine the identifier value
          switch(identifier) {
            case 'SELECT':
              query.select(expr.value);
              break;

            case 'FROM':
              query.from(expr.value);
              break;

            case 'SCHEMA':
              query.withSchema(expr.value);
              break;

            case 'DISTINCT':
              query.distinct(expr.value);
              break;
          }

          return;
        }

      });

    });

    var _SQL = query.toString();
    return exits.success(_SQL);
  },



};
