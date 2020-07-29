const symbols = ["(",")","\\",".","+","-","/","*","->"];
const types = ["int","bool"];
const keywords = ["if","else","then","true","false"];
// (\x:int->int.\y.x)(\x:int.x)10 + 10
const tokens = {
    "(":"LPAREN",
    ")":"RPAREN",
    "\\":"LAM",
    ".":"BODY",
    "+":"ADD",
    "-":"SUB",
    "*":"MUL",
    "/":"DIV",
    "->":"TO",
    "if":"IF",
    "else":"ELSE",
    "then":"THEN"
}

const white = [" ","\n","\b","\t"]
function isWhite(c) {
    return white.includes(c);
}

const digits = ["0","1","2","3","4","5","6","7","8","9"]
function isNumber(c) {
    return digits.includes(c);
}

function isAlphabet(c) {
    if(c) {
        const av = c.charCodeAt(0);
        return av >= "a".charCodeAt(0) && av <= "z".charCodeAt(0) ||
               av >= "A".charCodeAt(0) && av <= "Z".charCodeAt(0)   
    }
    return false;
}

function isBool(s) {
    return s == "true" || s == "false";
}

function token(name,value) {
    return { type:name, value:value }
}

function tokenize(string)
{
    const tokens = []
    console.log("here")
    console.log(string)
    let ch;
    let curr = 0;
    while(curr < string.length) {
        console.log("here")
        ch = string[curr]
        console.log(curr)
        console.log(ch)
        if(isWhite(ch)) {
            curr++;
            while(isWhite(ch)) ch = string[curr++];
        }
        if(symbols.includes(ch)) {
            curr++;
            if(ch == "-") {
                if(string[curr] == ">") ch += string[curr++]
                tokens.push(token(tokens[ch],ch))
            }
            else {
                tokens.push(token(tokens[ch],ch))
            }
        }
        else if(isNumber(ch)) {
            n = ""+ch
            ch = string[curr++]
            while(isNumber(ch)) n += (ch = string[curr++])
            tokens.push(token("LIT",n))
        }
        else if(isAlphabet(ch)) {
            n = ""+ch
            ch = string[curr++]
            while(isAlphabet(ch)) n += (ch = string[curr++])
            if(isBool(n)) tokens.push(token("LIT",n=="true"?true:false))
            else if(types.includes(n)) tokens.push(token("TYPE",n))
            else if(keywords.includes(n)) tokens.push(token(tokens[n],n))
            else tokens.push(token("IDEN",n))
        }
        else curr++;
    }
    return tokens
}
let gen = tokenize("\\x. x")
console.log(gen)

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

class Thunk {
    constructor(exp,env=null) {
        this.exp = exp;
        this.scope = env;
    }

    reduce() {

    }
}

class Lambda {
    constructor(body,param,env=null,need=false) {
        this.body = body;
        this.param = param;
        this.need = need;
        this.scope = env;
    }

    apply(actual,env) {
        // Create a new Env
        let frame = new Env(outer=this.scope);
        if(this.need) frame.create(this.param,actual);
        else frame.create(this.param,eval(actual,env));
        // add param to the frame
        return eval(this.body,frame);
    }
}


