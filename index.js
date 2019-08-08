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

    // 一个
    if (token.type == "key" && token.value == "select") {
      token = tokens[++current];
      let node = {
        type: "ChainNode",
        value: "select",
        param: []
      }

      while(!(token.type == "key" && token.value == "from")) {
        node.param.push(chain());
        token = tokens[current];
      }
      return node
    }

    if (token.type == "key" && token.value == "from") {
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
  return chain();
}





let tokens = tokenizer(input)
console.log(JSON.stringify(tokens, null, 2));
let p = parser(tokens)
console.log(JSON.stringify(p, null, 2));