<div align="center">
<img src="./static/styla.png" />
<h3> Simply Typed Lambda Calculus interpreter. </h3>
</div>
<hr></hr>

Styla is a small programming language/interpreter based on [simply typed lambda calculus](https://en.wikipedia.org/wiki/Simply_typed_lambda_calculus) with extensions. It is fundamentally an implementation of a type system over the original untyped lambda calculus (styla uses Church-style typing semantics). Styla provides three types - **`int`**, **`bool`** and **`->`**(function type) and implements static type checking, the language also supports **`if`** expressions and integer operations such as -  **`+`**, **`-`** etc. The basic lambda abstraction is written in *Haskell* style syntax - 

**`\x: int. x + 5`**,

**`\z: bool. if z then false else true`**. 

Lambda application is done by surrounding the lambda abstraction is in parens -

**`(\x: int. x + 5) 10`**,  **`(\y: bool. \z: bool. y) true false`** etc. 

`Note`: Application is left associative and has the highest precedence so this is **`(\y: bool. \z: bool. y) true false`** is interpreted as follows **`(((\y: bool. \z: bool. y) true) false)`**. 

The interpreter implements all the major application evaluation strategies i.e. [**`call by value`**](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_value) (This is the approach adopted by most languages), [**`call by name`**](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_name) (a lazy/non-strict approach) and [**`call by need`**](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_need) (a more optimized lazy/non-strict approach then `call by name`). 
More on how to change the evaluatation strategy type `help` in **REPL**.


## REPL

<img src="./static/repl.png" />

<img src="./static/repl2.png" />
