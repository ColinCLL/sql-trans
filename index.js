let input= "select name, version from table where name = test"

/**
 * 词法分析器
 * @param {String} input 
 * @return {Array} tokens
 */
function tokenizer(input) {
  let tokens = [], current = 0;

  console.log(input.length)
  while (current < input.length) {
    let char = input[current];
    // 匹配空字符和逗号, 空字符和逗号不重要可以忽略
    const WHITESPACE = /[\s,']/;
		if (WHITESPACE.test(char)) {
			current++;
			continue;
    }
    var LETTERS = /[a-z]/i;
		if (char && LETTERS.test(char)) {
			var value = "";

			// 同样，我们用一个循环遍历所有的字母，把它们存入 value 中。
			while (char && LETTERS.test(char)) {
				value += char;
				char = input[++current];
			}

			// 然后添加一个类型为 `word` 的 token，然后进入下一次循环。
			tokens.push({
				type: isKey(value) ? "key" : "word",
				value: value
			});

			continue;
    }
    let OPERATOR = /[=\*/\+-]/
    if (OPERATOR.test(char)) {
      tokens.push({
				type: "operator",
				value: char
      });
      current++;
    }
  }
  return tokens
}

/**
 * 判断是否是关键字
 * @param {String} word 
 * @return {Boolean}
 */
function isKey(word) {
  let keys = ["select", "from", "where"]
  return keys.indexOf(word) != -1;
}


/**
 * 语法分析器
 * @param {Array} tokens 
 * @return {Object}
 */
function parser(tokens) {
  let current = 0;

  function chain() {
    let token = tokens[current];


    if (token.type == "key" && token.value == "select") {
      token = tokens[++current];
      let node = {
        type: "key",
        value: "select",
        param: []
      }

      while(!(token.type == "key" && token.value == "from")) {
        node.param.push(chain());
        token = tokens[current];
      }
      return node
    }

    if (token.type == "key" && token.value == "where") {
      token = tokens[++current];
      let node = {
        type: "key",
        value: "where",
        param: [],
      }
      while(token && token.type != "key") {
        node.param.push(chain());
        token = tokens[current];
      }
      return node;
    }

    if (token.type == "key" && token.value == "from") {
      token = tokens[++current];
      let node = {
        type: "key",
        value: "from",
        param: [],
      }
      while(token && token.type != "key") {
        node.param.push(chain());
        token = tokens[current];
      }
      return node;
    }



    // 通用的key
    if (token.type == "key") {
      current++;
      return {
        type: "key",
        value: token.value
      }
    }

    if (token.type == "word") {
      current++;
      return {
        type: "word",
        value: token.value
      }
    }

    if (token.type == "operator") {
      current++;
      return {
        type: "operator",
        value: token.value
      }
    }
  }
  let ast = {
    type: "ChainNode",
    value: "select",
    param:[]
  }
  while (current < tokens.length) {
    ast.param.push(chain())
  }
  return ast;
}


/**
 * 代码生成器
 * @param {object} node 节点
 */
function codeGenerator(ast) {
  let code = {};
  function nodeCode(node) {

    if(node.type == "ChainNode") {
      node.param.map(n => {
        nodeCode(n)
      })
    }
    // 处理select里面的内容
    if (node.type == "key" && node.value == "select") {
      let selectNode = code["select"] = {}
      let col = {};
      node.param.map(n => {
        // 赋值
        col[n.value] = n.value
      })
      selectNode["col"] = col;
    }
  }
  nodeCode(ast);
  return code
}


let tokens = tokenizer(input);
// console.log(JSON.stringify(tokens, null, 2));
let ast = parser(tokens);
let code = codeGenerator(ast);

console.log(JSON.stringify(ast, null, 2));
console.log(JSON.stringify(code, null, 2));