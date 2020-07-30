// Type checker
// Based on -
// http://dev.stephendiehl.com/fun/type_systems.html#simply-typed-lambda-calculus
// https://www.cs.cornell.edu/courses/cs6110/2013sp/lectures/lec25-sp13.pdf

function arrayEquality(a1, a2) {
    let isEqual = false;
    for (let e1 of a1) {
        for (let e2 of a2) {
            if (Array.isArray(e1) && Array.isArray(e2)) arrayEquality(e1, e2);
            else if (e1 == e2) isEqual = true;
            else isEqual = false;
        }
    }
    return isEqual;
}

// Type Checker
function typecheck(ast) {
    const env = {};
    const addBinding = (name, type) => env[name] = type;
    const removeBinding = (name) => delete env[name];
    const lookUp = (name) => {
        if (env[name]) return env[name]
        console.log(env[name]);
        throw new Error(`Variable --> '${name}' not in Scope`)
    }
    const printType = (type) => Array.isArray(type)? `(${printType(type[0])}->${printType(type[1])})`:type
    const ops = ["ADD","SUB","DIV","MUL"]

    function check(ast) {
        // Add checking for binary operators
        if (ast.node == "literal") return ast.type
        if (ast.node == "var") return lookUp(ast.name)
        if (ops.includes(ast.node)) {
            const t1 = check(ast.l)
            const t2 = check(ast.r)
            if (t1 != "int" || t2 != "int") throw new Error(`Expected type 'int' for operands`)
            return t1;
        }
        if(ast.node == "condition") {
            const cond = check(ast.cond)
            if (cond != "bool") throw new Error(`Expected type 'bool' for 'if' condition`);
            const t1 = check(ast.exp1)
            const t2 = check(ast.exp2)
            if (t1 != t2) throw new Error(`Expected same type for both branches`)
            return t1;
        }
        else if (ast.node == "lambda") {
            addBinding(ast.param, ast.type);
            const type = check(ast.body);
            removeBinding(ast.param);
            return [ast.type, type];
        }
        else if (ast.node == "apply") {
            const t1 = check(ast.exp1);
            const t2 = check(ast.exp2);
            if (Array.isArray(t1)) {
                if (
                    Array.isArray(t1[0]) &&
                    Array.isArray(t2) &&
                    arrayEquality(t1[0], t2)
                ) return t2;
                else if (t1[0] == t2) return t2;
                else throw new Error(`Couldn't match the expected type: ${printType(t1[0])} with type: ${printType(t2)}`);
            }
            throw new Error(`Tried to apply to non-Function type --> ${t1}`)
        }
    }
    return printType(check(ast))
}

module.exports = typecheck;