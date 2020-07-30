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
    }

    reduce() {

    }
}

class Lambda {
    constructor(body, param, env = null, need = false) {
        this.body = body;
        this.param = param;
        this.need = need;
        this.scope = env;
    }

    apply(actual, env) {
        // Create a new Env
        let frame = new Env(outer = this.scope);
        if (this.need) frame.create(this.param, actual);
        else frame.create(this.param, eval(actual, env));
        // add param to the frame
        return eval(this.body, frame);
    }
}
