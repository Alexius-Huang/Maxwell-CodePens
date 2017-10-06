Array.prototype.includes = function(value) {
  return this.indexOf(value) !== -1
}
String.prototype.characterize = function(callback) {
  var characters = this.split('');
  var options = {};

  for (var i = 0; i < this.length; i++) {
    options = callback(characters[i]);
  }
}

var $textarea;
var $highlight;

var $keywords = ['False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];
var $functions = ['abs', 'dict', 'help', 'min', 'setattr', 'all', 'dir', 'hex', 'next', 'slice', 'any', 'divmod', 'id', 'object', 'sorted', 'ascii', 'enumerate', 'input', 'oct', 'staticmethod', 'bin', 'eval', 'int', 'open', 'str', 'bool', 'exec', 'isinstance', 'ord', 'sum', 'bytearray', 'filter', 'issubclass', 'pow', 'super', 'bytes', 'float', 'iter', 'print', 'tuple', 'callable', 'format', 'len', 'property', 'type', 'chr', 'frozenset', 'list', 'range', 'vars', 'classmethod', 'getattr', 'locals', 'repr', 'zip', 'compile', 'globals', 'map', 'reversed', '_import_', 'complex', 'hasattr', 'max', 'round', 'delattr', 'hash', 'memoryview', 'set'];

window.addEventListener('load', function() {
  $textarea = document.getElementById('textarea-input');
  $highlight = document.getElementById('highlight-area');

  var code = [
    'import os.path as path',
    'print(path.join("dir", "file")) # => "dir/file"',
    '',
    'age = 20',
    'if age <= 18:',
    '    print("Young")',
    'elif age <= 60:',
    '    print("Adult")',
    'else:',
    '    print("Old")',
    '# => "Adult"',
    '',
    'sum = 0',
    'for i in range(1, 10):',
    '    sum += i',
    '# => 45',
    '',
    'def fibonacci(n = 0):',
    '    if n == 0:',
    '        return 0',
    '    elif n == 1:',
    '        return 1',
    '    else:',
    '        return fibonacci(n - 1) + fibonacci(n - 2)',
    '',
    'class Cat:',
    '    def __init__(name, noise = "Meow"):',
    '        self.name = name',
    '        self.noise = noise',
    '',
    '    def makeNoise:',
    '        print(noise * 10)',
    ''
  ].join('\n')

  var triggerHighlight = function() {
    var tokens = tokenize($textarea.value);
    $highlight.innerHTML = '';
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      var span = document.createElement('span');
      span.className = 'highlight-' + token.type;
      span.innerText = token.value;
      $highlight.appendChild(span);
    }
    var lines = $textarea.value.split('\n');
    if (lines[lines.length - 1] === '') {
      var br = document.createElement('br');
      $highlight.appendChild(br);
    }
    $highlight.scrollTop = $textarea.scrollTop;
  };

  $textarea.addEventListener('input', triggerHighlight);
  $textarea.addEventListener('scroll', function(event) {
    $highlight.scrollTop = this.scrollTop;
  });

  var tabCode = 9;
  var leftParenthesisCode = 40;
  $textarea.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
      case tabCode:
        event.preventDefault();
        this.value += '    ';
        break;
    }
  });

  $textarea.innerText = code;
  $highlight.innerText = code;
  triggerHighlight()
});

function tokenize(inputString) {
  var tokens = [];
  var lexedValue = '';
  var currentToken = null;

  function newSpaceToken() {
    currentToken = { type: 'space', value: ' ' };
    lexedValue = '';
  }

  function parseLexedValueToToken() {
    if (lexedValue) {
      if ($keywords.includes(lexedValue)) {
        tokens.push({ type: 'keyword', value: lexedValue })
      } else if ($functions.includes(lexedValue)) {
        tokens.push({ type: 'function', value: lexedValue })
      } else if (lexedValue !== '') {
        if (isNaN(lexedValue)) {
          tokens.push({ type: 'default', value: lexedValue })
        } else {
          tokens.push({ type: 'number', value: lexedValue })
        }
      }
      lexedValue = '';
    }
  }

  function lex(char) {
    if (char !== ' ' && currentToken && currentToken.type === 'space' ) {
      tokens.push(currentToken);
      lexedValue = '';
      currentToken = null;
    }

    switch(char) {
      case ' ':
        if ($keywords.includes(lexedValue)) {
          tokens.push({ type: 'keyword', value: lexedValue })
          newSpaceToken();
        } else if ($functions.includes(lexedValue)) {
          tokens.push({ type: 'function', value: lexedValue })
          newSpaceToken();
        } else if (lexedValue !== '') {
          if (isNaN(lexedValue)) {
            tokens.push({ type: 'default', value: lexedValue })
          } else {
            tokens.push({ type: 'number', value: lexedValue })
          }
          newSpaceToken();
        } else if (currentToken) {
          currentToken.value += ' '
        } else {
          newSpaceToken();
        }
        break;
      
      case '"':
      case '\'':
        if (currentToken) {
          if (currentToken.type === 'string') {
            if (currentToken.value[0] === char) {
              currentToken.value += char
              tokens.push(currentToken)
              currentToken = null;
            } else {
              currentToken.value += char
            }
          } else if (currentToken.type === 'comment') {
            currentToken.value += char
          }
        } else {
          if (lexedValue) {
            tokens.push({ type: 'default', value: lexedValue });
            lexedValue = '';
          }
          currentToken = { type: 'string', value: char }
        }
        break;

      case '=':
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
      case '&':
      case '|':
      case '>':
      case '<':
      case '!':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'operator', value: char })
        }
        break;

      case '#':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          currentToken = { type: 'comment', value: char }
        }
        break;

      case ':':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'colon', value: char });
        }
        break;
      
      case '(':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'left-parentheses', value: char });
        }
        break;

      case ')':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'right-parentheses', value: char });
        }
        break;

      case '[':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'left-bracket', value: char });
        }
        break;

      case ']':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'right-bracket', value: char });
        }
        break;

      case ',':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'comma', value: char });
        }
        break;

      case '\n':
        if (currentToken) {
          switch(currentToken.type) {
            case 'string':
            case 'comment':
              tokens.push(currentToken)
              currentToken = null;
              break;
            default:
          }
        } else {
          parseLexedValueToToken();
          lexedValue = '';
        }
        tokens.push({ type: 'newline', value: '\n' });
        break;
        
      case ';':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'semicolon', value: char });
        }
        break;

      default:
        if (currentToken) {
          currentToken.value += char;
        } else {
          lexedValue += char
        }

        break;
    }
  }

  /* Lexing the input codes */
  inputString.characterize(lex);

  /* Rest of the lexed value or token which is unfinished */
  parseLexedValueToToken();

  if (currentToken) tokens.push(currentToken)

  /* Secondary Parse to Match Some Patterns */
  var isFunctionArgumentScope = false;
  var tokenCount = tokens.length;
  for (var i = 0; i < tokenCount; i++) {
    var token = tokens[i];
    if (token.type === 'keyword' && (token.value === 'def' || token.value === 'class')) {
      var peekToken = tokens[i + 2]
      if (peekToken && peekToken.type === 'default') peekToken.type = 'function-name';
    } else if (token.type === 'default' && isFunctionArgumentScope) {
      token.type = 'argument';
    } else if (token.type === 'left-parentheses') {
      var peekToken = tokens[i - 1]
      if (peekToken && peekToken.type === 'function-name') isFunctionArgumentScope = true;
    } else if (token.type === 'right-parentheses') {
      isFunctionArgumentScope = false;
    }
  }

  return tokens
}
