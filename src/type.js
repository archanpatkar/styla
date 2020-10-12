// Type checker
// Based on -
// http://dev.stephendiehl.com/fun/type_systems.html#simply-typed-lambda-calculus
// https://www.cs.cornell.edu/courses/cs6110/2013sp/lectures/lec25-sp13.pdf

// Dep
const ops = ["ADD", "SUB", "DIV", "MUL"]

// Utils
function arrayEquality(a1, a2) {
    if(a1.length != a2.length) return false;
    let isEqual = false;
    for(let i of a1) {
        if(a1[i] == a2[i]) isEqual = true;
        else if(Array.isArray(a1[i]) && Array.isArray(a2[i])) isEqual = arrayEquality(a1[i],a2[i]);
        else isEqual = false;
    } 
    return isEqual;
}
const printType = (type) => Array.isArray(type) ? `(${printType(type[0])}->${printType(type[1])})` : type;

// Errors
const genericError = (msg) => { throw new Error(msg) };
const notInScope = (name) => genericError(`Variable --> '${name}' not in Scope`);
const notType = (type,msg) => genericError(`Expected type '${printType(type)}' ${msg}`);
const typeMismatch = (type1,type2) => genericError(`Couldn't match the expected type: ${printType(type1)} with type: ${printType(type2)}`);
const nonFunction = (type) => genericError(`Tried to apply to non-Function type --> ${type}`);

class TypeChecker {
    constructor() {
        this.env = {};
    }

    clear() {
        this.env = {};
    }

    addBinding(name, type) {
        this.env[name] = type
    }

    removeBinding(name) {
        delete this.env[name]
    }

    lookUp(name) {
        if (this.env[name]) return this.env[name]
        notInScope(name);
    }

    check(ast) {
        if (ast.node == "literal") return ast.type
        if (ast.node == "var") return this.lookUp(ast.name)
        if (ops.includes(ast.node)) {
            const t1 = this.check(ast.l)
            const t2 = this.check(ast.r)
            if (t1 != "int" || t2 != "int") notType("int","for operands");
            return t1;
        }
        if(ast.node == "NEG") {
            const t1 = this.check(ast.val);
            if (t1 != "int") notType("int","for using unary '-' op");
            return t1;
        }
        if (ast.node == "condition") {
            const cond = this.check(ast.cond)
            if (cond != "bool") notType("bool","for 'if' condition");
            const t1 = this.check(ast.exp1)
            const t2 = this.check(ast.exp2)
            if (t1 != t2) generic("Expected same type for both branches");
            return t1;
        }
        else if (ast.node == "lambda") {
            this.addBinding(ast.param, ast.type);
            const type = this.check(ast.body);
            this.removeBinding(ast.param);
            return [ast.type, type];
        }
        else if (ast.node == "apply") {
            const t1 = this.check(ast.exp1);
            const t2 = this.check(ast.exp2);
            if (Array.isArray(t1)) {
                if (
                    Array.isArray(t1[0]) &&
                    Array.isArray(t2) &&
                    arrayEquality(t1[0], t2)
                ) return t1[1];
                else if (t1[0] == t2) return t1[1];
                else typeMismatch(t1[0],t2)
            }
            nonFunction(t1);
        }
        else genericError("Unrecognizable ast node");
    }

    prove(ast) {
        return printType(this.check(ast))
    }
}

module.exports = TypeChecker;