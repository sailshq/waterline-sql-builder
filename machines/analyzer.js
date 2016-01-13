module.exports = {


  friendlyName: 'Analyzer',


  description: 'Analyzes the tokens and groups them together based on function',


  cacheable: true,


  sync: true,


  inputs: {

    tokens: {
      description: 'The tokenized values that make up the query',
      example: [{}],
      required: true
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'The grouped and ordered results',
      example: [[]]
    },

  },


  fn: function(inputs, exits) {

    var _ = require('lodash');
    var tokens = inputs.tokens;
    var results = [];


    //  ╦╔╦╗╔═╗╔╗╔╔╦╗╦╔═╗╦╔═╗╦═╗  ╔═╗╔═╗╔═╗╦═╗╔═╗╦ ╦
    //  ║ ║║║╣ ║║║ ║ ║╠╣ ║║╣ ╠╦╝  ╚═╗║╣ ╠═╣╠╦╝║  ╠═╣
    //  ╩═╩╝╚═╝╝╚╝ ╩ ╩╚  ╩╚═╝╩╚═  ╚═╝╚═╝╩ ╩╩╚═╚═╝╩ ╩
    //
    // Given an identifier, search for it and group the results.
    function indentifierSearch(identifier) {
      var idx = _.findIndex(tokens, { type: 'IDENTIFIER', value: identifier });
      if(idx > -1) {

        var statement = [];
        statement.push(tokens[idx]);
        statement.push(tokens[idx+1]);

        // Remove the values
        _.pullAt(tokens, idx, idx+1);

        // TODO: Update when we add sub-queries
        results.push(statement);
      }
    }

    //  ╔═╗╦═╗╔═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ╠╣ ╠╦╝║ ║║║║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚  ╩╚═╚═╝╩ ╩  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Start analyzing by finding any top level FROM statements and bring those
    // to the top of the results. This has to do with the way Knex works but
    // shouldn't actually matter when the ordering is used.
    indentifierSearch('FROM');


    //  ╔═╗╔═╗╦  ╔═╗╔═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ╚═╗║╣ ║  ║╣ ║   ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╚═╝╩═╝╚═╝╚═╝ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the SELECT statements and group those
    indentifierSearch('SELECT');


    //  ╔═╗╔═╗╦ ╦╔═╗╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ╚═╗║  ╠═╣║╣ ║║║╠═╣  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╚═╝╩ ╩╚═╝╩ ╩╩ ╩  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the SCHEMA statements and group those
    indentifierSearch('SCHEMA');


    //  ╔╦╗╦╔═╗╔╦╗╦╔╗╔╔═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //   ║║║╚═╗ ║ ║║║║║   ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ═╩╝╩╚═╝ ╩ ╩╝╚╝╚═╝ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the DISTINCT statements and group those
    indentifierSearch('DISTINCT');


    // Find any LEVEL statements and group them together
    // TODO


    return exits.success(results);
  },



};
