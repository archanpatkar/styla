const symbols = ["(",")","\\","if","else","then",".","+","-","/","*","->"];
const types = ["int","bool"];
const keywords = []
// /(x:int).x
// (\x:int->int.\y.x)(\x:int.x)10 + 10

function empty(str)
{
    if(
        str == "" || str == " " || 
        str == "\n" || str == "\b" || 
        str == "\t"
    ) return true;
    return false;
}



function tokenize(string)
{

}


// function parse(string,values)
// {
//     let parsed = [];
//     for(let s in string)
//     {
//         let i = 0;
//         while(i < string[s].length) 
//         {
//             let str = string[s][i++];
//             if(!symbols.includes(str) && !empty(str))
//             {
//                 let temp = "";
//                 while(!empty(str) && !symbols.includes(str) && i < string[s].length)
//                 {
//                     temp += str;
//                     str = string[s][i++];
//                 }
//                 parsed.push(temp);
//             }
//             if(!empty(str)) parsed.push(str);
//         }
//         if(values[s] != undefined) parsed.push(new value(values[s]));
//     }
//     return parsed;
// }

// let macros = {};

// function ast(parsed,first=true)
// {
//     let node = [];
//     let char = parsed.shift();
//     while(first?parsed.length != 0:char != ")")
//     {
//         if(parsed.length == 0) throw new SyntaxError("Missing `)`");
//         if(char == "(") node.push(ast(parsed,false));
//         else node.push(char);
//         char = parsed.shift();
//     }
//     return node;
// }


// AST Nodes
function Lam(param,type,body) {
    return {node:"lambda", param:param, type:type, body:body }
}

function Lit(type,val) {
    return {node:"literal", type:type, val:val}
}

function Var(name) {
    return {node:"var", name:name}
}

function App(lam,param) {
    return {node:"apply", exp1:lam, exp2:param}
}


// Type Checker
function typecheck(ast)
{
    const env = {};
    const addBinding = (name,type) => env[name] = type;
    const removeBinding = (name) => delete env[name];
    const lookUp = (name) => {
        if(type = env[name]) return type
        throw new Error(`Variable --> '${name}' not in Scope`)
    }
    function check(ast) {
        if(ast.node == "literal") return ast.type
        if(ast.node == "var") return lookUp(ast.name)
        else if(ast.node == "lambda") {
            addBinding(ast.param,ast.type);
            const type = check(ast.body);
            removeBinding(ast.param);
            return [ast.type,type];
        }
        else if(ast.node == "apply") {
            const t1 = check(ast.exp1);
            const t2 = check(ast.exp2);
            if(Array.isArray(t1)){
                if(t1[0] == t2) return t2;
                else throw new Error(`Couldn't match the expected type: ${t1[0]} with type: ${t2}`);
            }
            throw new Error(`Tried to apply to non-Function type --> ${t1}`)
        }
    }
    return check(ast)
}


// Simple test
const code = App(Lam("x","int",Var("z")),Lit("bool",10));
console.log(code)
try {
    console.log(typecheck(code))
}
catch(e) {
    console.log(e.message)
}

// Evaluater
class Env {
    constructor(params, args, outer = null, obj = null) {
        if (obj == null) {
            this.env = {};
            for (let i in args) {
                this.env[params[i]] = args[i];
            }
        } else {
            this.env = obj;
        }
        this.outer = outer;
    }

    find(variable) {
        if (variable in this.env) {
            return this;
        } else if (this.outer != null || this.outer != undefined) {
            return this.outer.find(variable);
        }
    }

    update(variable,value) {
        if (variable in this.env) {
            this.env[variable] = value;
            return this.env[variable];
        } else if (this.outer != null || this.outer != undefined) {
            return this.outer.update(variable,value);
        }
    }

    create(variable,value)
    {
        this.env[variable] = value;
    }
}

class Lambda {
    constructor(body,param,env=null,need=false) {
        this.body = body;
        this.param = param;
        this.need = need;
        this.scope = env;
    }

    execute(actual) {
        // Create a new Env
        let frame = new Env(outer=this.scope);
        if(this.need) frame.create(this.param,actual);
        else frame.create(this.param,eval(actual,this.env));
        // add param to the frame
        return eval(this.body,frame);
    }
}


