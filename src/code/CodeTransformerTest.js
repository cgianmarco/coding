var CodeTransfomer = require('./CodeTransformer.js').rewrite

assert(
    CodeTransfomer(""), 
    '"use strict";  this.script = async function() {  }')

assert(
    CodeTransfomer("function pippo() {}"), 
    '"use strict";  this.script = async function() { async function pippo() {} }'
)

assert(
    CodeTransfomer("function pippo() {}; return pippo()"), 
    '"use strict";  this.script = async function() { async function pippo() {}; return await pippo() }'
)

assert(
    CodeTransfomer(
`
function pippo() {

}; 
return pippo()`
), 
`"use strict";  this.script = async function() { 
async function pippo() {

}; 
return await pippo() }`
)

assert(
    CodeTransfomer("function pippo(a, b, c) {}; return pippo(1, 2, 3)"), 
    '"use strict";  this.script = async function() { async function pippo(a, b, c) {}; return await pippo(1, 2, 3) }'
)

assert(
    CodeTransfomer("console.log('nasty()')"), 
    '"use strict";  this.script = async function() { await console.log(\'nasty()\') }'
)

assert(
    CodeTransfomer("for (var i = 0 ; i < 5 ; i++) { }"), 
    '"use strict";  this.script = async function() { for (var i = 0 ; i < 5 ; i++) { } }'
)

assert(
    CodeTransfomer("", {prova: "value"}), 
    '"use strict"; const prova = this[\"prova\"]; this.script = async function() {  }'
)

console.log("OK")

function assert(current, expected, message = `Assertion doesn't match:\ncurrent \t${current}\nexpected\t${expected}`) {
    if (current !== expected) {
        throw new Error(message)
    }
}