// 该demo展示的是一个语法编译器，编译器就是将一种变成语言转化成另一种变成语言执行，也是babel的工作原理。
// 这个是将sql语言转化成js语言执行编译器, 没有相关经验，可以直接到最后看执行代码和结果

// jc是自己写的含有类sql规则的计算方法，经过多年生产环境校验了.
let jc = require("jcalculator"); 

/**
 * 词法分析器
 * @param {String} input
 * @return {Array} tokens
 */
function tokenizer(input) {
  let tokens = [],
    current = 0;

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
        value: value,
      });

      continue;
    }
    let OPERATOR = /[=\*/\+-]/;
    if (OPERATOR.test(char)) {
      tokens.push({
        type: "operator",
        value: char,
      });
      current++;
    }
  }
  return tokens;
}

/**
 * 判断是否是关键字
 * @param {String} word
 * @return {Boolean}
 */
function isKey(word) {
  let keys = ["select", "from", "where", "group", "by"];
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

    if (token.type === "key" && token.value === "select") {
      token = tokens[++current];
      let node = {
        type: "key",
        value: "select",
        param: [],
      };

      while (!(token.type === "key" && token.value === "from")) {
        node.param.push(chain());
        token = tokens[current];
      }
      return node;
    }

    if (token.type === "key" && token.value === "where") {
      token = tokens[++current];
      let node = {
        type: "key",
        value: "where",
        param: [],
      };
      while (token && token.type != "key") {
        node.param.push(chain());
        token = tokens[current];
      }
      return node;
    }

    if (token.type === "key" && token.value === "from") {
      token = tokens[++current];
      let node = {
        type: "key",
        value: "from",
        param: [],
      };
      while (token && token.type != "key") {
        node.param.push(chain());
        token = tokens[current];
      }
      return node;
    }

    if (token.type === "key" && token.value === "group") {
      if (tokens[current + 1].value !== "by") throw "Lack of keywords: 'by'";
      current += 2;
      token = tokens[current];
      let node = {
        type: "key",
        value: "groupBy",
        param: [],
      };
      while (token && token.type != "key") {
        node.param.push(chain());
        token = tokens[current];
      }
      return node;
    }

    // 通用的key
    if (token.type === "key") {
      current++;
      return {
        type: "key",
        value: token.value,
      };
    }

    if (token.type === "word") {
      current++;
      return {
        type: "word",
        value: token.value,
      };
    }

    if (token.type === "operator") {
      current++;
      return {
        type: "operator",
        value: token.value,
      };
    }
  }
  let ast = {
    type: "ChainNode",
    value: "select",
    param: [],
  };
  while (current < tokens.length) {
    ast.param.push(chain());
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
    if (node.type === "ChainNode") {
      node.param.map((n) => {
        nodeCode(n);
      });
    }

    // 处理select
    if (node.type === "key" && node.value === "select") {
      let selectNode = (code["select"] = {});
      let col = {};
      node.param.map((n) => {
        col[n.value] = n.value;
      });
      selectNode["col"] = col;
    }

    if (node.type === "key" && node.value === "from") {
      code["from"] = "table";
    }

    if (node.type === "key" && node.value === "groupBy") {
      code["groupBy"] = [];

      node.param.map((row) => {
        code["groupBy"].push(row.value);
      });
    }

    if (node.type === "key" && node.value === "where") {
      let funBody = "";
      let isKey = true;
      node.param.map((n) => {
        let nodeValue = "";
        if (n.type === "operator") {
          nodeValue = {
            and: "&&",
            or: "||",
            "=": "==",
          }[n.value];
          funBody += nodeValue;
          isKey = false;
        } else {
          nodeValue = n.value;
          funBody += isKey ? `row.${nodeValue}` : `'${nodeValue}'`;
        }
      });
      code["where"] = new Function("row", "return " + funBody);
    }
  }
  nodeCode(ast);
  return code;
}

// let tokens = tokenizer(input);
// // console.log(JSON.stringify(tokens, null, 2));
// let ast = parser(tokens);
// let code = codeGenerator(ast);
// code.from = data

// let test = jc.sql(code)

// 把方法挂在Array原型链上，array可以直接使用
Array.prototype.sql = function (input) {
  let tokens = tokenizer(input); // 解析语法
  // console.log(JSON.stringify(tokens, null, 2));
  let ast = parser(tokens); // 把语法转成抽象语法树
  let code = codeGenerator(ast); // 把语法树转成目标语言语法
  code.from = data = this; // 把数据指向数组本身
  return jc.sql(code); // 自己写的计算规则工具，执行
};

let data = [
  {
    version: "1.0",
    name: "test",
    value: "233",
  },
  {
    version: "1.0.1",
    name: "test",
    value: "233",
  },
  {
    version: "1.1",
    name: "test1",
    value: "666",
  },
];

let input = "select name, version from table where name = test";

// console.log(JSON.stringify(ast, null, 2));
// console.log(JSON.stringify(code, null, 2));
// console.log(JSON.stringify(test, null, 2));
// data.sql(input) // 数组可以直接执行sql

console.log(JSON.stringify(data.sql(input), null, 2)); // 把执行结果转成文字打印出来
