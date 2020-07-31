// Evaluater
const Parser = require("./parser");
const TypeChecker = require("./type");

// Eval types
const need = 0;
const name = 1;
const value = 2;

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
            return this.env[variable];
        } else if (this.outer) {
            return this.outer.find(variable);
        }
    }

    update(variable, value) {
        if (variable in this.env) {
            this.env[variable] = value;
            return this.env[variable];
        } else if (this.outer) {
            return this.outer.update(variable, value);
        }
    }

    create(variable, value) {
        this.env[variable] = value;
    }
}

class Thunk {
    constructor(exp, env = null,intp) {
        this.exp = exp;
        this.scope = env;
        this.reduced = false;
        this.intp = intp;
    }

    value() {
        return this.intp.ieval(this.exp, this.scope);
    }

    reduce() {
        if(!this.reduced)
        {
            this.exp = this.intp.ieval(this.exp, this.scope);
            this.reduced = true;
        }
        return this.exp;
    }

    toString() {
        return `<thunk>`;   
    }
}

class Lambda {
    constructor(body, param, env = null, intp) {
        this.body = body;
        this.param = param;
        this.scope = env;
        this.intp = intp;
    }

    apply(actual) {
        let frame = new Env(null, null, this.scope, {});
        frame.create(this.param, actual);
        const out = this.intp.ieval(this.body, frame);
        return out;
    }

    toString() {
        return this.scope?"<closure>":"<lambda>";   
    }
}

class Interpreter { 
    constructor() {
        this.parser = new Parser();
        this.checker = new TypeChecker();
        this.mode = value;
    }

    setMode(mode) {
        this.mode = mode;
    }

    ieval(ast, env) {
        if (ast.node == "literal") return ast.val;
        else if (ast.node == "var")  {
            const v = env.find(ast.name);
            if (v instanceof Thunk) {
                if(this.mode == name) return v.value();
                else return v.reduce();
            }
            return v;
        }
        else if (ast.node == "condition") {
            const cond = this.ieval(ast.cond, env);
            if (cond) return this.ieval(ast.exp1, env);
            else return this.ieval(ast.exp2, env);
        }
        else if (ast.node == "lambda") {
            return new Lambda(ast.body, ast.param, env, this);
        }
        else if (ast.node == "apply") {
            const lam = this.ieval(ast.exp1,env);
            let out;
            if(this.mode == value) out = lam.apply(this.ieval(ast.exp2,env));
            else out = lam.apply(new Thunk(ast.exp2,env,this));
            return out;
        }
        else if (ast.node == "ADD") 
            return this.ieval(ast.l, env) + this.ieval(ast.r, env);
        else if (ast.node == "SUB") 
            return this.ieval(ast.l, env) - this.ieval(ast.r, env);
        else if (ast.node == "MUL") 
            return this.ieval(ast.l, env) * this.ieval(ast.r, env);
        else if (ast.node == "DIV") 
            return this.ieval(ast.l, env) / this.ieval(ast.r, env);
        else if (ast.node == "NEG") return -this.ieval(ast.val,env);
    }    

    evaluate(str) {
        const ast = this.parser.parse(str);
        this.checker.clear();
        const type = this.checker.prove(ast);
        const output = this.ieval(ast,null);
        return { output:output, type:type };
    }
}

module.exports =  {
    Interpreter:Interpreter, 
    modes: {
        "need":need,
        "name":name,
        "value":value
    }
};