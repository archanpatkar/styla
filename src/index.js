const symbols = ["(",")","\\","if","else","then","=",".","+","-","/","*","->"];
const types = ["int","bool"]
// \(x:int).x
// let d = \x.\y.x
// (\x:int->int.\y.x)(\x:int.x)10 

function empty(str)
{
    if(
        str == "" || str == " " || 
        str == "\n" || str == "\b" || 
        str == "\t"
    ) return true;
    return false;
}

function value(v)
{
    this.value = v;
}

function tokenize(string)
{

}


function parse(string,values)
{
    let parsed = [];
    for(let s in string)
    {
        let i = 0;
        while(i < string[s].length) 
        {
            let str = string[s][i++];
            if(!symbols.includes(str) && !empty(str))
            {
                let temp = "";
                while(!empty(str) && !symbols.includes(str) && i < string[s].length)
                {
                    temp += str;
                    str = string[s][i++];
                }
                parsed.push(temp);
            }
            if(!empty(str)) parsed.push(str);
        }
        if(values[s] != undefined) parsed.push(new value(values[s]));
    }
    return parsed;
}

let macros = {};

function ast(parsed,first=true)
{
    let node = [];
    let char = parsed.shift();
    while(first?parsed.length != 0:char != ")")
    {
        if(parsed.length == 0) throw new SyntaxError("Missing `)`");
        if(char == "(") node.push(ast(parsed,false));
        else node.push(char);
        char = parsed.shift();
    }
    return node;
}
