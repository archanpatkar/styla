const readline = require('readline');
const tokenize = require("./lexer");
const parse = require("./parser");
const typecheck = require("./type");
const eval = require("./eval");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'styla> '
});

console.log("styla (Simply Typed Lambda Calculus) 0.0.1");
console.log("");

rl.prompt();
let log = false;

rl.on('line', (input) => {
    if(input == "help") {
        console.log("Type 'clear' to clean the console")
        console.log("Type 'exit' or Ctrl + c to exit")
        console.log("Type 'log' to toggle (on) / (off) logging of Tokens and AST")
    }
    else if(input == "log") log = !log;
    else if(input == "clear") console.clear();
    else if(input == "exit") {
        rl.close();
        return;
    }
    else {
        try {
            const tokens = tokenize(input);
            if(log) console.log(tokens);
            const ast = parse(tokens);
            if(log) console.log(JSON.stringify(ast,undefined,4));
            const type = typecheck(ast)
            const out = eval(ast);
            console.log(`${type}: ${out}`);
        }
        catch (e) {
            console.log(e.message)
        }
    }
    rl.prompt();
});