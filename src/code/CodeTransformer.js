const Logger = require('../logging/Logger.js')

const LOG = new Logger('code.compiler')

function findStringsPoints(code) {
    var jsStringRegex = /((".*?[^\\]")|('.*?[^\\]')|(`.*?[^\\]`))/g

    var indexes = []
    let match;
    while ((match = jsStringRegex.exec(code)) !== null) {
        indexes.push([match.index, (match.index + match[0].length)])
    }
    
    return indexes;
}
function notContainedIn(indexes, index) {
    return !indexes.find(([start, end]) => start < index && end > index)
}
const KEYWORKDS = new Set(["do", "if", "in", "for", "let", "new", "try", "var", "case", "else", "enum", "eval", "null", "this", "true", "void", "with", "await", "break", "catch", "class", "const", "false", "super", "throw", "while", "yield", "delete", "export", "import", "public", "return", "static", "switch", "typeof", "default", "extends", "finally", "package", "private", "continue", "debugger", "function", "arguments", "interface", "protected", "implements", "instanceof"])
function notJsKeyword(token) {
    return !KEYWORKDS.has(token)
}
/**
 * Transforms every function declaration into an async function,
 * and their usage into an await call
 * 
 *      function something() {
 *          return 1
 *      }
 *      1 + something()
 * Into:
 *      async function something() {
 *          return 1
 *      }
 *      1 + await something()
 * @param {*} code 
 */
function makeFunctionDeclarationAsync(code) {
    var jsFunctionCallRegex = /(([$A-Za-z_][0-9A-Za-z_$]*\s*)\.)?([$A-Za-z_][0-9A-Za-z_$]*)\s*\(/g;
    var jsFunctionRegex = /function (await)?/g
    var stringsIndexes  = findStringsPoints(code)

    code = code.replace(jsFunctionCallRegex, (match, object, _, method, offset, _2) => {
        if (notContainedIn(stringsIndexes, offset) && notJsKeyword(method)) {
            return `await ${object ? object : ''}${method}(`
        }
        else {
            return match
        }
    })
    code = code.replace(jsFunctionRegex, (match, _, offset, _2) => {
        if (notContainedIn(stringsIndexes, offset)) {
            return 'async function'
        }
        else {
            return match
        }
    })
    return code;
}

module.exports = {
    rewrite: function (code, globalVars = {}) {
        code = makeFunctionDeclarationAsync(code)

        let globalVarsDeclaration = Object.keys(globalVars)
                .reduce((agg, k) => `${agg}const ${k} = this["${k}"];`, '')
    
        return `"use strict"; ${globalVarsDeclaration} this.script = async function() { ${code} }`;
    },
    compile: function(code, globalVars = {}) {
    
        code = this.rewrite(code, globalVars)
    
        let ctx = globalVars;

        LOG.debug(code, ctx);
        
        new Function(code)
            .apply(ctx)

        return ctx.script;
    }
}