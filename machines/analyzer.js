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
    var writeChunk = function writeChunk(data, wrapped, container) {
      var chunk = data;
      var wrappedChunk = wrapped;
      var results = container;

      try {
        // Remove the trailing comma from the chunk
        chunk = chunk.slice(0, -1);

        // If this is a wrapped chunk, close it off
        if (wrappedChunk) {
          wrappedChunk = false;
          chunk += ']';
        }

        // Close the chunk
        chunk += ']';

        // Write the chunk
        results.push(JSON.parse(chunk));
      } catch (e) {
        throw new Error('Error parsing chunk', chunk);
      }
    };


    var analyzer = function analyzer(tokens) {
      // Hold the results of the token processing
      var results = [];

      // Hold the current chunk
      var chunk;

      // Hold the flag for wrapping a chunk
      var wrappedChunk;

      // Process the token list in order
      _.each(tokens, function analyzeToken(token) {
        //  ╦╔╦╗╔═╗╔╗╔╔╦╗╦╔═╗╦╔═╗╦═╗╔═╗
        //  ║ ║║║╣ ║║║ ║ ║╠╣ ║║╣ ╠╦╝╚═╗
        //  ╩═╩╝╚═╝╝╚╝ ╩ ╩╚  ╩╚═╝╩╚═╚═╝
        //
        // If the token is an identifier, write the current chunk and start a
        // new one.
        if (token.type === 'IDENTIFIER') {
          if (chunk) {
            writeChunk(chunk, wrappedChunk, results);
          }

          // Start a new chunk
          chunk = '[' + JSON.stringify(token) + ',';

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
          // Remove the last comma from the group
          chunk = chunk.slice(0, -1);
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
        writeChunk(chunk, wrappedChunk, results);
      }

      return results;
    };

    // Kick off the analyzer. Could run one or more times depending on the use
    // of subqueries.
    var analyzedTokens = analyzer(tokens);

    return exits.success(analyzedTokens);
  }

};
