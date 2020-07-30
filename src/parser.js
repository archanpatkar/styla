// TDOP/Pratt Parser
// Based on http://crockford.com/javascript/tdop/tdop.html

// AST Nodes
function Lam(param, type, body) {
    return { node: "lambda", param: param, type: type, body: body }
}

function Lit(type, val) {
    return { node: "literal", type: type, val: val }
}

function Var(name) {
    return { node: "var", name: name }
}

function App(lam, param) {
    return { node: "apply", exp1: lam, exp2: param }
}

function Condition(cond,e1,e2) {
    return { node: "condition", cond:cond, exp1: e1, exp2: e2 }
}

function BinOp(op, l, r) {
    return { node: op, l: l, r: r }
}

function UnOp(op,v) {
    return { node: op, val: v }
}

// Parser
function parse(tokens) {
    function consume() {
        return tokens.shift();
    }

    function peek() {
        return tokens[0];
    }

    function expect(next, msg) {
        if (next && tokens[0].type == next) return consume();
        throw new Error(msg);
    }

    function eatWhite() {
        while(peek().type == "WHITE") consume();
    }

    const prec = {
        "APP":5,
        "NEG":4,
        "MUL":3,
        "DIV":3,
        "SUB":2,
        "ADD":2
    };

    const handle = {
        "IDEN": {
            nud(token) {
                return Var(token.value);
            },
            led(left) {
                // const right = expression(0);
                // return App(left,right);
                expect(null,`'${left.name}' not a binary operator`);
            }
        },
        "LIT": {
            nud(token) {
                if (typeof token.value == "number") return Lit("int", token.value);
                return Lit("bool", token.value);
            },
            led(left) {
                expect(null,`'${left.val}' not a binary operator`);
            }
        },
        "LPAREN": {
            nud() {
                const exp = expression(0);
                expect("RPAREN", "Unmatched paren '('");
                return exp;
            },
            led() {
                expect(null,"'(' not a binary operator");
            }
        },
        "MUL": {
            nud() {
                expect(null,"'*' not a unary operator");
            },
            led(left) {
                const right = expression(prec["MUL"]);
                return BinOp("MUL",left,right);
            }
        },
        "DIV": {
            nud() {
                expect(null,"'/' not a unary operator");
            },
            led(left) {
                const right = expression(prec["DIV"]);
                return BinOp("DIV",left,right);
            }
        },
        "SUB": {
            nud() {
                return UnOp("NEG",expression(prec["NEG"]));
            },
            led(left) {
                const right = expression(prec["SUB"]);
                return BinOp("SUB",left,right);
            }
        },
        "ADD": {
            nud() {
                expect(null,"'+' not a unary operator");
            },
            led(left) {
                const right = expression(prec["ADD"]);
                return BinOp("ADD",left,right);
            }
        },
        "IF": {
            nud() {
                const cond = expression(0);
                expect("THEN","Expected keyword 'then'");
                const e1 = expression(0);
                expect("ELSE","Expected keyword 'else'");
                const e2 = expression(0);
                return Condition(cond,e1,e2);
            },
            led() {
                expect(null,"'if' is not a unary operator");
            }
        },
        "LAM": {
            type(after) {
                let t = expect("TYPE",`Expected type after '${after}'`).value;
                if(peek().type == "TO") {
                    consume();
                    let t2 = this.type("->");
                    return [t,t2];
                }
                else return t;
            },
            nud() {
                const param = expression(0);
                if(param.node != "var") expect(null,"Expected an identifier");
                expect("DEFT","Expected ':'");
                const type = this.type(":");
                expect("BODY","Expected '.'");
                const body = expression(0);
                return Lam(param.name,type,body);
            },
            led() {
                expect(null,"'\\' is not a unary operator");
            }
        },
        "APPLY": {
            led(left) {
                const right = expression(prec["APP"]);
                return App(left,right);
            }
        }
    }

    let ops = ["ADD","SUB","DIV","MUL"];
    let not = ["EOF","RPAREN","LAM","TO","DEFT","BODY","THEN","ELSE"];
    function expression(min) {
        let left;
        let token = consume();
        if(token.type == "EOF") expect(null,"Unexpected end")
        if(handle[token.type]) left = handle[token.type].nud(token);
        token = peek();
        while(ops.includes(token.type) && min < prec[token.type]) {
            token = consume();
            left = handle[token.type].led(left);
            token = peek();
        }
        // let current = expression(0);
        while(!not.includes(peek().type)) {
            left = handle["APPLY"].led(left);
        }
        return left;
    }
    return expression(0);
}

module.exports = parse;