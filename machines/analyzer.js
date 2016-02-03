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
    }

  },


  fn: function analyze(inputs, exits) {
    var _ = require('lodash');
    var tokens = inputs.tokens;


    //   █████╗ ███╗   ██╗ █████╗ ██╗  ██╗   ██╗███████╗███████╗██████╗
    //  ██╔══██╗████╗  ██║██╔══██╗██║  ╚██╗ ██╔╝╚══███╔╝██╔════╝██╔══██╗
    //  ███████║██╔██╗ ██║███████║██║   ╚████╔╝   ███╔╝ █████╗  ██████╔╝
    //  ██╔══██║██║╚██╗██║██╔══██║██║    ╚██╔╝   ███╔╝  ██╔══╝  ██╔══██╗
    //  ██║  ██║██║ ╚████║██║  ██║███████╗██║   ███████╗███████╗██║  ██║
    //  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝
    //
    // Runs through the tokens and based on the surrounding tokens groups them
    // together into logical pieces that can be passed to functions inside the
    // Sequelizer.

    // Key/Value pair tokens
    var KEY_VALUE_TOKENS = ['KEY', 'VALUE', 'OPERATOR', 'COMBINATOR'];

    // Wrapped tokens
    var WRAPPED_TOKENS = ['JOIN', 'INNERJOIN'];

    //  ╦ ╦╦═╗╦╔╦╗╔═╗  ╔═╗╦ ╦╦ ╦╔╗╔╦╔═
    //  ║║║╠╦╝║ ║ ║╣   ║  ╠═╣║ ║║║║╠╩╗
    //  ╚╩╝╩╚═╩ ╩ ╚═╝  ╚═╝╩ ╩╚═╝╝╚╝╩ ╩
    //
    // Given a chunk of data, write it to the result container
    var writeChunk = function writeChunk(chunk, wrappedChunk, results, write) {
      try {
        // Remove the trailing comma from the chunk
        if (chunk.charAt(chunk.length - 1) === ',') {
          chunk = chunk.slice(0, -1);
        }

        // If this is a wrapped chunk, close it off
        if (wrappedChunk) {
          wrappedChunk = false;
          chunk += ']';
        }

        // Close the chunk, unless it's empty
        if (chunk.charAt(chunk.length - 1) !== '[') {
          chunk += ']';
        }

        // Write the chunk
        if (write) {
          results.push(JSON.parse(chunk));
        }
      } catch (e) {
        throw new Error('Error parsing chunk');
      }

      return chunk;
    };


    var analyzer = function analyzer(tokens) {
      // Hold the results of the token processing
      var results = [];

      // Hold the current chunk
      var chunk;

      // Hold the flag for wrapping a chunk
      var wrappedChunk = false;

      // Hold the flag array for wrapping a subquery
      var subquery = [];
      var subqueryTag = false;

      // Process the token list in order
      _.each(tokens, function analyzeToken(token) {
        //  ╔═╗╦ ╦╔╗ ╔═╗ ╦ ╦╔═╗╦═╗╦ ╦
        //  ╚═╗║ ║╠╩╗║═╬╗║ ║║╣ ╠╦╝╚╦╝
        //  ╚═╝╚═╝╚═╝╚═╝╚╚═╝╚═╝╩╚═ ╩
        //
        // If the token is a subquery, flag it as such and open up a new group
        // on the chunk.
        if (token.type === 'SUBQUERY') {
          subquery.push(true);
          subqueryTag = true;
          chunk += JSON.stringify(token) + ', [';
          return;
        }

        if (token.type === 'ENDSUBQUERY') {
          subquery.pop();

          // Remove the trailing comma from the chunk
          if (chunk.charAt(chunk.length - 1) === ',') {
            chunk = chunk.slice(0, -1);
          }

          // Double close here to also close up the identifier that opened the
          // subquery.
          chunk += ']],';

          return;
        }

        //  ╦╔╦╗╔═╗╔╗╔╔╦╗╦╔═╗╦╔═╗╦═╗╔═╗
        //  ║ ║║║╣ ║║║ ║ ║╠╣ ║║╣ ╠╦╝╚═╗
        //  ╩═╩╝╚═╝╝╚╝ ╩ ╩╚  ╩╚═╝╩╚═╚═╝
        //
        // If the token is an identifier, write the current chunk and start a
        // new one.
        if (token.type === 'IDENTIFIER') {
          // The write flag determines if the clause is ready to be parsed and
          // written to the results. If we are inside a subquery it shouldn't
          // be written to the results until the end. It should be closed though.
          var write = subquery.length ? false : true;

          // If there is an active chunk write it
          if (chunk) {
            chunk = writeChunk(chunk, wrappedChunk, results, write);
          }

          // The subquery tag toggles itself off after the first chunk of data.
          // It represents the opening of the subquery so there shouldn't be a
          // comma or we would end up with [,[
          if (subquery.length && !subqueryTag) {
            chunk += ',';
          }

          // Toggle off the subqueryTag
          if (subquery.length && subqueryTag) {
            subqueryTag = false;
          }

          // Start a new chunk unless there is a subquery being built
          if (subquery.length) {
            chunk += '[' + JSON.stringify(token) + ',';
          } else {
            chunk = '[' + JSON.stringify(token) + ',';
          }

          // If this is a wrapped chunk, add an extra '['
          if (_.indexOf(WRAPPED_TOKENS, token.value) > -1) {
            wrappedChunk = true;
            chunk += '[';
          }

          return;
        }

        //  ╦╔═╔═╗╦ ╦  ╦  ╦╔═╗╦  ╦ ╦╔═╗  ╔═╗╔═╗╦╦═╗╔═╗
        //  ╠╩╗║╣ ╚╦╝  ╚╗╔╝╠═╣║  ║ ║║╣   ╠═╝╠═╣║╠╦╝╚═╗
        //  ╩ ╩╚═╝ ╩    ╚╝ ╩ ╩╩═╝╚═╝╚═╝  ╩  ╩ ╩╩╩╚═╚═╝
        //
        // Handles simple key/value pairs for KEY/VALUE/OPERATOR tokens
        if (_.indexOf(KEY_VALUE_TOKENS, token.type) > -1) {
          chunk += JSON.stringify(token) + ',';
          return;
        }

        //  ╔═╗╦═╗╔═╗╦ ╦╔═╗╦╔╗╔╔═╗
        //  ║ ╦╠╦╝║ ║║ ║╠═╝║║║║║ ╦
        //  ╚═╝╩╚═╚═╝╚═╝╩  ╩╝╚╝╚═╝

        // If this is a GROUP token, open a new grouping pair.
        if (token.type === 'GROUP') {
          chunk += '[';
          return;
        }

        // Save the current group to the condition
        if (token.type === 'ENDGROUP') {
          // Remove the trailing comma from the group
          if (chunk.charAt(chunk.length - 1) === ',') {
            chunk = chunk.slice(0, -1);
          }

          // Close the group
          chunk += '],';
          return;
        }

        //  ╔═╗╔═╗╔╗╔╔╦╗╦╔╦╗╦╔═╗╔╗╔╔═╗
        //  ║  ║ ║║║║ ║║║ ║ ║║ ║║║║╚═╗
        //  ╚═╝╚═╝╝╚╝═╩╝╩ ╩ ╩╚═╝╝╚╝╚═╝
        //
        // Only some conditions are actually written out

        if (token.type === 'CONDITION' && token.value === 'NOT') {
          chunk += JSON.stringify(token) + ',';
          return;
        }

        if (token.type === 'CONDITION' && token.value === 'IN') {
          chunk += JSON.stringify(token) + ',';
          return;
        }
      });

      // Add the last chunk onto the stack
      if (chunk) {
        var write = subquery.length ? false : true;
        writeChunk(chunk, wrappedChunk, results, write);
      }

      return results;
    };

    // Kick off the analyzer. Could run one or more times depending on the use
    // of subqueries.
    var analyzedTokens = analyzer(tokens);

    return exits.success(analyzedTokens);
  }

};
