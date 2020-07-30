// Evaluater
const need = "NEED";
const name = "NAME";
const value = "VALUE";
function evaluate(ast,mode=value) 
{   
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
                return this[variable];
            } else if (this.outer != null || this.outer != undefined) {
                return this.outer.find(variable);
            }
        }
    
        update(variable, value) {
            if (variable in this.env) {
                this.env[variable] = value;
                return this.env[variable];
            } else if (this.outer != null || this.outer != undefined) {
                return this.outer.update(variable, value);
            }
        }
    
        create(variable, value) {
            this.env[variable] = value;
        }
    }
    
    class Thunk {
        constructor(exp, env = null) {
            this.exp = exp;
            this.scope = env;
            this.reduced = false;
        }
    
        reduce(replace,config) {
            const out = eval(this.exp,)
        }
    }
    
    class Lambda {
        constructor(body, param, env = null, need = false) {
            this.body = body;
            this.param = param;
            this.need = need;
            this.scope = env;
        }
    
        apply(actual) {
            // Create a new Env
            let frame = new Env(null,null,this.scope,{});
            frame.create(this.param, actual);
            // if (this.need) 
            // else frame.create(this.param, eval(actual, env));
            // add param to the frame
            return eval(this.body, frame);
        }
    }

    let ops = ["ADD","SUB","DIV","MUL"];
    function eval(ast,env) {
        console.log(ast);
        if(ast.node == "literal") {
            return ast.val;
        }
        else if(ast.node == "var") {
            return env.find(ast.name);
        }
        else if(ops.includes(ast.op)) {
            // console.log("here2");
            if(ast.op == "ADD") return eval(ast.l,env) + eval(ast.r,env);
            else if(ast.op == "SUB") return eval(ast.l,env) - eval(ast.r,env);
            else if(ast.op == "MUL") return eval(ast.l,env) * eval(ast.r,env);
            else if(ast.op == "DIV") return eval(ast.l,env) / eval(ast.r,env);
        }
        else if(ast.op == "NEG") {
            return -ast.val;
        }
        else if(ast.node == "condition") {
            const cond = eval(ast.cond,env);
            if(cond) return eval(ast.exp1,env);
            else return eval(ast.exp1,env);
        }
        else if(ast.node == "lambda") {
            return new Lambda(ast.body,ast.param,env);
        }
        else if(ast.node == "apply") {
            const lam = eval(ast.exp1);
            return lam.apply(eval(ast.exp2));
        }
    }   
    const out = eval(ast,new Env(null,null,null,{}));
    // console.log("HERE");
    // console.log(out);
    return out;
}

module.exports = evaluate;