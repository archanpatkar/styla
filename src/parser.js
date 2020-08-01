// TDOP/Pratt Parser
// Based on http://crockford.com/javascript/tdop/tdop.html
const tokenize = require("./lexer");

// AST Nodes
const Lam = (param, type, body) => ({ node: "lambda", param: param, type: type, body: body });
const Lit = (type, val) => ({ node: "literal", type: type, val: val });
const Var = (name) => ({ node: "var", name: name });
const App = (lam, param) => ({ node: "apply", exp1: lam, exp2: param });
const Condition = (cond,e1,e2) => ({ node: "condition", cond:cond, exp1: e1, exp2: e2 });
const BinOp = (op, l, r) => ({ node: op, l: l, r: r });
const UnOp = (op,v) => ({ node: op, val: v });

const ops = ["ADD","SUB","DIV","MUL","NEG"];
const not = ["EOF","RPAREN","TO","DEFT","BODY","THEN","ELSE"];

const handlers = {
    "IDEN": {
        nud(token) {
            return Var(token.value);
        },
        led(left) {
            this.expect(null,`'${left.name}' not a binary operator`);
        }
    },
    "LIT": {
        nud(token) {
            if (typeof token.value == "number") return Lit("int", token.value);
            return Lit("bool", token.value);
        },
        led(left) {
            this.expect(null,`'${left.val}' not a binary operator`);
        }
    },
    "LPAREN": {
        nud() {
            const exp = this.expression(0);
            this.expect("RPAREN", "Unmatched paren '('");
            return exp;
        },
        led(left) {
            this.expect(null,"'(' not a binary operator");
        }
    },
    "MUL": {
        lbp:3,
        nud() {
            this.expect(null,"'*' not a unary operator");
        },
        led(left) {
            const right = this.expression(this.lbp);
            return BinOp("MUL",left,right);
        }
    },
    "DIV": {
        lbp:3,
        nud() {
            this.expect(null,"'/' not a unary operator");
        },
        led(left) {
            const right = this.expression(this.lbp);
            return BinOp("DIV",left,right);
        }
    },
    "SUB": {
        rbp:4,
        lbp:2,
        nud() {
            return UnOp("NEG",this.expression(this.rbp));
        },
        led(left) {
            const right = this.expression(this.lbp);
            return BinOp("SUB",left,right);
        }
    },
    "ADD": {
        lbp:2,
        nud() {
            this.expect(null,"'+' not a unary operator");
        },
        led(left) {
            const right = this.expression(this.lbp);
            return BinOp("ADD",left,right);
        }
    },
    "IF": {
        nud() {
            const cond = this.expression(0);
            this.expect("THEN","Expected keyword 'then'");
            const e1 = this.expression(0);
            this.expect("ELSE","Expected keyword 'else'");
            const e2 = this.expression(0);
            return Condition(cond,e1,e2);
        },
        led() {
            this.expect(null,"'if' is not a binary operator");
        }
    },
    "LAM": {
        type(after) {
            let t = this.expect("TYPE",`Expected type after '${after}'`).value;
            if(this.peek().type == "TO") {
                this.consume();
                let t2 = this.type("->");
                return [t,t2];
            }
            else return t;
        },
        nud() {
            const param = this.expression(0);
            if(param.node != "var") this.expect(null,"Expected an identifier");
            this.expect("DEFT","Expected ':'");
            const type = this.type(":");
            this.expect("BODY","Expected '.'");
            const body = this.expression(0);
            return Lam(param.name,type,body);
        },
        led() {
            expect(null,"'\\' is not a binary operator");
        }
    },
    "APPLY": {
        lbp:5,
        led(left) {
            const right = this.expression(this.lbp);
            return App(left,right);
        }
    }
}

function multiThis(func,...obj) {
    let merged = new Proxy({ all: obj }, {
        set(target,key,value) {
            let o = undefined;
            for(let e of target.all) {
                if(e[key]) {
                    o = e[key] = value;
                    break;
                }
            }
            return o;
        },
        get(target,key) {
            let o = undefined;
            for(let e of target.all) {
                if(e[key]) {
                    o = e[key];
                    break;
                }
            }
            return o;
        }
    });
    return func.bind(merged);
}

class Parser {
    constructor() {}

    consume() {
        return this.tokens.shift();
    }

    peek() {
        return this.tokens[0];
    }

    expect(next, msg) {
        if (next && this.peek().type == next)
            return this.consume();
        throw new Error(msg);
    }

    expression(min,pleft) {
        let left = pleft;
        let token = this.peek();
        if(token.type == "EOF") this.expect(null,"Unexpected end");
        if(handlers[token.type] && !left) {
            token = this.consume();
            left = multiThis(handlers[token.type].nud,handlers[token.type],this)(token);
        }
        token = this.peek();
        while(ops.includes(token.type) && min < handlers[token.type].lbp) {
            token = this.consume();
            left = multiThis(handlers[token.type].led,handlers[token.type],this)(left);
            token = this.peek();
        }
        while(!not.includes(this.peek().type) && min < handlers["APPLY"].lbp) {
            left = multiThis(handlers["APPLY"].led,handlers[token.type],this)(left);
            if(ops.includes(this.peek().type)) left = this.expression(0,left);
        }
        return left;
    }

    parse(str) {
        this.tokens = tokenize(str);
        return this.expression(0);
    }
}

module.exports = Parser;