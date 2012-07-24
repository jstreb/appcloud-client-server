#! /usr/bin/env node

var program = require("commander");

function list( val ) {
  console.log( val );
}

program
  .version('0.0.1')
  .option( '-n, --name', 'The name of the application')
  .option( '-v, --views [views]', 'A list of views to auto-generate', list )
  .parse(process.argv);
  
console.log( program.views );