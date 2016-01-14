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
        // Do it in two steps because of a weird bug in Lodash that I need to
        // look into.
        // TODO: Look into why lodash treats this array differently
        _.pullAt(tokens, idx);
        _.pullAt(tokens, idx);

        // TODO: Update when we add sub-queries
        results.push(statement);
      }
    }

    //  ╔═╗╔═╗╔╗╔╔╦╗╦╔╦╗╦╔═╗╔╗╔  ╦ ╦╔═╗╔╗╔╔╦╗╦  ╦╔╗╔╔═╗
    //  ║  ║ ║║║║ ║║║ ║ ║║ ║║║║  ╠═╣╠═╣║║║ ║║║  ║║║║║ ╦
    //  ╚═╝╚═╝╝╚╝═╩╝╩ ╩ ╩╚═╝╝╚╝  ╩ ╩╩ ╩╝╚╝═╩╝╩═╝╩╝╚╝╚═╝
    //
    // Handles SQL conditions such as OR and creates logical groups for each
    // part of the condition.
    //
    // The nested option here is a flag that decides if the results should be
    // wrapped in an array or not.
    function conditionHandler(tokens, nested) {

      // Search for an OR condition in the tokens
      var conditionIdx = _.findIndex(tokens, { type: 'CONDITION', value: 'OR' });

      // If there are no conditions, check for any grouping needed and return
      // the data.
      if(conditionIdx < 0) {
        return processConditionGroup(tokens);
      }

      // If there are nested conditions, work from the inner most condition outwards.
      // This gives us capture groups for nesting starting with the deepest
      // nesting and working our way outwards.

      // Find the limits of this condition by looking for the last ENDCONDITION
      // token.
      var outerIdx = _.findLastIndex(tokens, { type: 'ENDCONDITION' });

      // Create a set of tokens that excludes the current OR condition
      var data = _.slice(tokens, conditionIdx+1, outerIdx);

      // If we are in a nested condition, wrap the results in an array.
      var results;
      var nestedResults = conditionHandler(data, true);
      if(nested) {
        results = [nestedResults];
      } else {
        results = nestedResults;
      }

      // Reset the tokens to exclude the pulled values
      tokens = _.concat(_.slice(tokens, 1, conditionIdx), _.slice(tokens, outerIdx+2));

      // If we have more results, add them to the results array
      var sets = processConditionGroup(tokens);
      if(_.isArray(sets)) {
        results.push(sets);
      }

      return results;
    }


    // Given a set of tokens, check for nested conditions and then group the
    // pieces of the current condition into logical groups.
    function processConditionGroup(tokens) {

      // Hold the capture groups
      var groups = [];

      // Run through the tokens and create arrays for everything in between
      // GROUP/ENDGROUP tokens.
      (function groupedCondition(_tokens) {

        // Find the end of this group
        var startIdx = _.findIndex(_tokens, { type: 'GROUP' });
        var endIdx = _.findIndex(_tokens, { type: 'ENDGROUP' });
        if(endIdx < 0) { return; }

        // Add the data between the GROUP/ENDGROUP to the groups array
        groups.push(_.slice(_tokens, startIdx+1, endIdx));

        // If we are not on the last item in the condition, continue grouping
        if(_tokens.length > endIdx + 1) {
          groupedCondition(_.slice(_tokens, endIdx+1));
        }
      })(tokens);

      // If there is only one group don't return an array of arrays
      if(groups.length === 1) {
        groups = _.first(groups);
      }

      // If we have capture groups, return those. Otherwise just send the
      // original tokens back.
      var results = groups.length ? groups : tokens;
      if(!results.length) {
        results = undefined;
      }

      return results;
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

    //  ╦ ╦╦ ╦╔═╗╦═╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║╠═╣║╣ ╠╦╝║╣   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚╩╝╩ ╩╚═╝╩╚═╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Process the values contained in the WHERE statement.
    (function() {

      // Check for a WHERE statement
      var idx = _.findIndex(tokens, { type: 'IDENTIFIER', value: 'WHERE' });
      if(idx < 0) { return; }

      // Find the next Identifier so we know the scope of the WHERE.
      // To do this slice the array at the WHERE index, pull off the where, then
      // see if there are any remaining Identifiers.
      var slice = _.slice(tokens, idx);
      var whereIdentifier = _.first(_.pullAt(slice, 0));

      var endIdx = _.findIndex(slice, { type: 'IDENTIFIER' });
      if(endIdx < 0) { endIdx = undefined; }

      // Limit the tokens to only those needed to fufill the WHERE clause
      var whereTokens = _.slice(slice, idx, endIdx);

      // Process and group and conditions.
      // ex: OR
      var groupedTokens = conditionHandler(whereTokens);

      // Add the WHERE identifier back in
      groupedTokens.unshift(whereIdentifier);
      
      results.push(groupedTokens);
    })();


    // Find any LEVEL statements and group them together
    // TODO


    return exits.success(results);
  },



};
