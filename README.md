<div align="center">
<img src="./static/styla.png" />
<h3> Simply Typed Lambda Calculus interpreter. </h3>
</div>
<hr></hr>

Styla is a small programming language/interpreter based on [simply typed lambda calculus](https://en.wikipedia.org/wiki/Simply_typed_lambda_calculus) with extensions. It is fundamentally an implementation of a type system over the original untyped lambda calculus (styla uses Church-style typing semantics). Styla provides three types - **`int`**, **`bool`** and **`->`**(function type) and implements static type checking, the language also supports **`if`** expressions and integer operations such as -  **`+`**, **`-`** etc. The basic lambda abstraction is written in *Haskell* style syntax - 

**`(\x: int. x + 5)`**,

**`(\z: bool. if z then false else true)`**. 

Lambda application is done by writing the parameters next to the lambda abstraction which should be covered in parens for disambiguation-

**`(\x: int. x + 5) 10`**,  

**`(\y: bool. \z: bool. y) true false`** etc. 

`Note`: Application is left associative and has the highest precedence so this is **`(\y: bool. \z: bool. y) true false`** is interpreted as follows **`(((\y: bool. \z: bool. y) true) false)`**. 

The interpreter implements all the major application evaluation strategies i.e. 
1. [**`call by value`**](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_value) (This is the approach adopted by most languages) 
2. [**`call by name`**](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_name) (a lazy/non-strict approach)  
3. [**`call by need`**](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_need) (a more optimized lazy/non-strict approach then `call by name`). 

<br>

More on how to change the evaluatation strategy type `help` in **REPL**.

Styla, because the [stlc](https://en.wikipedia.org/wiki/Simply_typed_lambda_calculus) is strongly normalizing so it cannot encode recursion i.e. fix point combinators(Y combinator etc) and therefore is a decidable problem i.e. it always halts and normalizes to a value. The language is not [turing complete](https://en.wikipedia.org/wiki/Turing_completeness) because for being turing complete it has to be capable of simulating the [universal turing machine](https://en.wikipedia.org/wiki/Universal_Turing_machine) for which the halting problem is undecidable.

## Install
Clone the repo and `cd` into the repo folder and then execute -
#### `npm install -g`
After it succesfully installs globally then type(to open the **REPL**) -
#### `styla`

## REPL

<img src="./static/repl.png" />

<img src="./static/repl2.png" />
