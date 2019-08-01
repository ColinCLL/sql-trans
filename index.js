let input= "select name, version form table where name = test"

/**
 * @param {String} input 
 * @return {Array} tokens
 */
function tokenizer(input) {
  let tokens = [], current = 0;

  console.log(input.length)
  console.log(input[48])
  console.log(input[49])
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

function isKey(word) {
  let keys = ["select", "form", "where"]
  return keys.indexOf(word) != -1;
}

let tokens = tokenizer(input)
console.log(JSON.stringify(tokens, null, 2));