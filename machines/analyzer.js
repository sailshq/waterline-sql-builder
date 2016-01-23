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
      var orConditionIdx = _.findIndex(tokens, { type: 'CONDITION', value: 'OR' });

      // If there are no OR conditions, check for any grouping needed and return
      // the data.
      if(orConditionIdx < 0) {
        return processConditionGroup(tokens);
      }

      // If there are nested conditions, work from the inner most condition outwards.
      // This gives us capture groups for nesting starting with the deepest
      // nesting and working our way outwards.

      // Find the limits of this condition by looking for the last ENDCONDITION
      // token.
      var outerIdx = _.findLastIndex(tokens, { type: 'ENDCONDITION', value: 'OR' });

      // Create a set of tokens that excludes the current OR condition
      var data = _.slice(tokens, orConditionIdx+1, outerIdx);

      // If we are in a nested condition, wrap the results in an array.
      var results;
      var nestedResults = conditionHandler(data, true);
      if(nested) {
        results = [nestedResults];
      } else {
        results = nestedResults;
      }

      // Store the boundaries of the data we used, this way was can pull out data
      // that has already been processed and continue working our way outward.
      var front = _.slice(tokens, 1, orConditionIdx);
      var rear = _.slice(tokens, outerIdx+2);

      // If there is anything left on the front of the array, prepend it to the
      // result set. These usually include things like "NOT", etc.
      if(front.length) {

        // If there is only a single item, it shouldn't be wrapped in an array
        if(front.length === 1) {
          front = _.first(front);
        }

        // Check if the first result is an array, this represents a nested OR
        // statement. In this case, stick out values on the front of the first
        // item. A good example of when this comes into play is the nested
        // WHERE NOT example in the tests file.
        if(_.isArray(results) && _.isArray(_.first(results))) {
          _.first(results).unshift(front);
        }

        // Otherwise stick it on the front of the result set
        else if(_.isArray(results)) {
          results.unshift(front);
        }
      }

      // Set the tokens to the remaining values
      tokens = rear;

      // If we have more results, add them to the results array
      var sets = processConditionGroup(tokens);
      if(_.isArray(sets)) {
        results.push(sets);
      }

      return results;
    }


    // Given a set of tokens, create an array of grouped elements that make up
    // a logical set of the query.
    function processConditionGroup(tokens) {

      // Hold the capture groups
      var groups = [];

      // Run through the tokens and create arrays for everything in between
      // GROUP/ENDGROUP tokens.
      function groupedCondition(_tokens) {

        // Find the end of this group
        var startIdx = _.findIndex(_tokens, { type: 'GROUP' });
        var endIdx = _.findIndex(_tokens, { type: 'ENDGROUP' });
        if(endIdx < 0) { return; }

        // Add the data between the GROUP/ENDGROUP to the groups array
        var data = _.slice(_tokens, startIdx+1, endIdx);
        if(!data.length) { return; }

        groups.push(data);

        // If we are not on the last item in the condition, continue grouping
        if(_tokens.length > endIdx + 1) {
          var nextIteration = _.slice(_tokens, endIdx+1);
          groupedCondition(nextIteration);
        }
      }

      // Kick off the recursive parsing
      groupedCondition(tokens);

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


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗   ╦╔═╗╦╔╗╔  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗   ║║ ║║║║║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚╝╚═╝╩╝╚╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Given a set of tokens that make up a join statement, process them into
    // a logical set of tokens.
    function processJoinStatement(tokens, joinType) {

      var statementTokens = [];

      // Find the start of the join statement
      var startIdx = _.findIndex(tokens, { type: 'IDENTIFIER', value: joinType });

      // Slice off the front of the array so we start with out join statement
      var joinTokens = _.slice(tokens, startIdx+1);

      // Find the end of the join statement
      var endIdx = _.findIndex(joinTokens, { type: 'IDENTIFIER' });

      // Slice the array so we only have tokens related to this join statement
      if(endIdx > -1) {
        joinTokens = _.slice(joinTokens, 0, endIdx);
      }

      // Add these tokens to the statements array
      statementTokens.push(joinTokens);

      // We want to next extract these join tokens from the array. Start by
      // building the front of the tokens array and the end minus the joinTokens.
      var front = _.slice(tokens, 0, startIdx);

      // If there are no more tokens left after the join, use an empty array
      var end = [];
      if(endIdx > -1) {
        end = _.slice(tokens, startIdx+endIdx+1);
      }

      // Remove the join tokens from the original tokens array.
      tokens = _.concat(front, end);

      // If there are more joins, continue processing
      if(_.findIndex(tokens, { type: 'IDENTIFIER', value: joinType }) > -1) {
        statementTokens = statementTokens.concat(processJoinStatement(tokens, joinType));
      }

      return statementTokens;
    }


    //  ╔═╗╦═╗╔═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ╠╣ ╠╦╝║ ║║║║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚  ╩╚═╚═╝╩ ╩  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Start analyzing by finding any top level FROM statements and bring those
    // to the top of the results. This has to do with the way Knex works but
    // shouldn't actually matter when the ordering is used.
    indentifierSearch('FROM');


    //  ╦ ╦╔═╗╦╔╗╔╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║ ║╚═╗║║║║║ ╦  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╚═╝╩╝╚╝╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the USING statements and group those
    indentifierSearch('USING');


    //  ╦╔╗╔╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║║ ║ ║ ║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╩╝╚╝ ╩ ╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the INTO statements and group those
    indentifierSearch('INTO');


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


    //  ╔═╗╔═╗╦ ╦╔╗╔╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║  ║ ║║ ║║║║ ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╚═╝╚═╝╝╚╝ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the COUNT statements and group those
    indentifierSearch('COUNT');


    //  ╔═╗╔═╗╔═╗╦═╗╔═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣║ ╦║ ╦╠╦╝║╣ ║ ╦╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╩╚═╚═╝╚═╝╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    //
    // Next find the aggregation statements and group those
    indentifierSearch('MIN');
    indentifierSearch('MAX');
    indentifierSearch('SUM');
    indentifierSearch('AVG');


    //  ╔═╗╦═╗╔═╗╦ ╦╔═╗  ╔╗ ╦ ╦  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║ ╦╠╦╝║ ║║ ║╠═╝  ╠╩╗╚╦╝  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╩╚═╚═╝╚═╝╩    ╚═╝ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the GROUP BY statements and group those
    indentifierSearch('GROUPBY');


    //  ╦  ╦╔╦╗╦╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║  ║║║║║ ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╩═╝╩╩ ╩╩ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the LIMIT statements and group those
    indentifierSearch('LIMIT');


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║ ║╠╣ ╠╣ ╚═╗║╣  ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╚  ╚  ╚═╝╚═╝ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the OFFSET statements and group those
    indentifierSearch('OFFSET');


    //  ╔╦╗╔═╗╦  ╔═╗╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //   ║║║╣ ║  ║╣  ║ ║╣   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ═╩╝╚═╝╩═╝╚═╝ ╩ ╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the DELETE statements
    (function() {
      var idx = _.findIndex(tokens, { type: 'IDENTIFIER', value: 'DELETE' });
      if(idx > -1) {

        var statement = [];
        statement.push(tokens[idx]);

        // Remove the value
        _.pullAt(tokens, idx);

        results.push(statement);
      }
    })();

    //  ╔═╗╦═╗╔╦╗╔═╗╦═╗  ╔╗ ╦ ╦  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗╔═╗
    //  ║ ║╠╦╝ ║║║╣ ╠╦╝  ╠╩╗╚╦╝  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║ ╚═╗
    //  ╚═╝╩╚══╩╝╚═╝╩╚═  ╚═╝ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩ ╚═╝
    //
    // Next find all the ordering statements and group them
    (function() {

      // Check for an ORDER BY statement
      var idx = _.findIndex(tokens, { type: 'IDENTIFIER', value: 'ORDERBY' });
      if(idx < 0) { return; }

      // Find the next Identifier so we know the scope of the Order statements.
      // To do this slice the array at the ORDERBY index, pull off the values, then
      // see if there are any remaining Identifiers.
      var slice = _.slice(tokens, idx);
      var identifier = _.first(_.pullAt(slice, 0));

      var endIdx = _.findIndex(slice, { type: 'IDENTIFIER' });
      if(endIdx < 0) { endIdx = undefined; }

      // Limit the tokens to only those needed to fufill the ORDER clause
      var orderTokens = _.slice(slice, idx, endIdx);
      orderTokens.unshift({ type: 'IDENTIFIER', value: 'ORDERBY' });

      // Add the tokens to the results
      results.push(orderTokens);
    })();


    //  ╦╔╗╔╔═╗╔═╗╦═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║║╚═╗║╣ ╠╦╝ ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╩╝╚╝╚═╝╚═╝╩╚═ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the INSERT statements and group those
    (function() {

      // Check for an INSERT statement
      var idx = _.findIndex(tokens, { type: 'IDENTIFIER', value: 'INSERT' });
      if(idx < 0) { return; }

      // Find the next Identifier so we know the scope of the INSERT.
      // To do this slice the array at the INSERT index, pull off the values, then
      // see if there are any remaining Identifiers.
      var slice = _.slice(tokens, idx);
      var identifier = _.first(_.pullAt(slice, 0));

      var endIdx = _.findIndex(slice, { type: 'IDENTIFIER' });
      if(endIdx < 0) { endIdx = undefined; }

      // Limit the tokens to only those needed to fufill the INSERT clause
      var insertTokens = _.slice(slice, idx, endIdx);
      insertTokens.unshift({ type: 'IDENTIFIER', value: 'INSERT' });

      // Add the tokens to the results
      results.push(insertTokens);
    })();


    //  ╦ ╦╔═╗╔╦╗╔═╗╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║ ║╠═╝ ║║╠═╣ ║ ║╣   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╩  ═╩╝╩ ╩ ╩ ╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    //
    // Next find the UPDATE statements and group those
    (function() {

      // Check for an INSERT statement
      var idx = _.findIndex(tokens, { type: 'IDENTIFIER', value: 'UPDATE' });
      if(idx < 0) { return; }

      // Find the next Identifier so we know the scope of the UPDATE.
      // To do this slice the array at the UPDATE index, pull off the values, then
      // see if there are any remaining identifiers.
      var slice = _.slice(tokens, idx);
      var identifier = _.first(_.pullAt(slice, 0));

      var endIdx = _.findIndex(slice, { type: 'IDENTIFIER' });
      if(endIdx < 0) { endIdx = undefined; }

      // Limit the tokens to only those needed to fufill the UPDATE clause
      var updateTokens = _.slice(slice, 0, endIdx);
      updateTokens.unshift({ type: 'IDENTIFIER', value: 'UPDATE' });

      if(endIdx > -1) {
        tokens = _.slice(tokens, endIdx+1);
      }

      // Add the tokens to the results
      results.push(updateTokens);
    })();


    //   ╦╔═╗╦╔╗╔  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗╔═╗
    //   ║║ ║║║║║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║ ╚═╗
    //  ╚╝╚═╝╩╝╚╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩ ╚═╝
    (function() {

      // Check for any JOIN statements
      var joins = [];

      _.each([
        'join',
        'innerJoin',
        'outerJoin',
        'crossJoin',
        'leftJoin',
        'leftOuterJoin',
        'rightJoin',
        'rightOuterJoin',
        'fullOuterJoin'
      ], function(_joinIdentifier) {
        var _idx = _.findIndex(tokens, { type: 'IDENTIFIER', value: _joinIdentifier.toUpperCase() });
        if(_idx > -1) {
          joins.push(_joinIdentifier.toUpperCase());
        }
      });

      if(!joins.length) { return; }

      // Parse each JOIN set into a set of tokens
      _.each(joins, function(joinType) {
        var joinTokens = processJoinStatement(tokens, joinType);
        joinTokens.unshift({ type: 'IDENTIFIER', value: joinType });
        results.push(joinTokens);
      });
    })();


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



    return exits.success(results);
  },



};
