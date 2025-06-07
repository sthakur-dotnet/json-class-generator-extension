import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('jsonClassGenerator.open', () => {
    const panel = vscode.window.createWebviewPanel(
      'jsonClassGenerator',
      'JSON Class Generator',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case 'copy':
            vscode.env.clipboard.writeText(message.text);
            vscode.window.showInformationMessage('Copied to clipboard!');
            break;
        }
      },
      undefined,
      context.subscriptions
    );
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>JSON Class Generator</title>
<style>
  body {
    margin: 0; padding: 0;
    font-family: Consolas, "Courier New", monospace;
    background-color: #121212;
    color: #eee;
    display: flex;
    height: 100vh;
    overflow: hidden;
  }
  #container {
    display: flex;
    width: 100%;
    height: 100%;
  }
  #jsonInput, #output {
    flex: 1;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #333;
    background: #1e1e1e;
    overflow: auto;
    height: 100%;
  }
  #jsonInput {
    margin-right: 10px;
  }
  textarea {
    width: 100%;
    height: 80%;
    background: #252526;
    border: none;
    color: #ccc;
    font-family: Consolas, "Courier New", monospace;
    font-size: 14px;
    padding: 8px;
    box-sizing: border-box;
    resize: none;
    border-radius: 4px;
  }
  button, select, input[type="text"] {
    margin-top: 10px;
    background: #0e639c;
    border: none;
    color: white;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover, select:hover, input[type="text"]:hover {
    background: #1177d1;
  }
  #tree {
    font-family: monospace;
    font-size: 14px;
    line-height: 1.4;
    white-space: pre;
    user-select: none;
  }
  .collapsible {
    cursor: pointer;
    user-select: none;
  }
  .collapsed > ul {
    display: none;
  }
  ul {
    list-style-type: none;
    margin-left: 1em;
    padding-left: 1em;
    border-left: 1px dotted #666;
  }
  li {
    margin: 2px 0;
  }
  .key {
    color: #9cdcfe;
  }
  .string {
    color: #ce9178;
  }
  .number {
    color: #b5cea8;
  }
  .boolean {
    color: #569cd6;
  }
  .null {
    color: #808080;
  }
  #generatedClassContainer {
    margin-top: 10px;
    height: 60%;
    background: #252526;
    border-radius: 4px;
    overflow: auto;
    padding: 10px;
    white-space: pre-wrap;
  }
  #copyButton {
    margin-top: 5px;
    background: #007acc;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    color: white;
    cursor: pointer;
  }
  #copyButton:hover {
    background: #005a9e;
  }
</style>
</head>
<body>
  <div id="container">
    <div id="jsonInput">
      <h3>JSON Input</h3>
      <textarea id="inputArea" placeholder="Paste your JSON here..."></textarea><br />
      <button id="formatBtn">Format JSON & Show Tree</button>
      <br />
      <h3>Tree View</h3>
      <div id="tree"></div>
    </div>
    <div id="output">
      <h3>Generate Classes</h3>
      <select id="langSelect">
        <option value="csharp">C#</option>
        <option value="java">Java</option>
        <option value="typescript">TypeScript</option>
      </select>
      <input type="text" id="className" placeholder="Root class name" value="RootClass" style="margin-left: 10px;" />
      <br />
      <button id="generateBtn">Generate Class</button>
      <div id="generatedClassContainer" style="display:none;"></div>
      <button id="copyButton" style="display:none;">Copy to Clipboard</button>
    </div>
  </div>

<script>
  const vscode = acquireVsCodeApi();

  const inputArea = document.getElementById('inputArea');
  const formatBtn = document.getElementById('formatBtn');
  const treeContainer = document.getElementById('tree');
  const generateBtn = document.getElementById('generateBtn');
  const langSelect = document.getElementById('langSelect');
  const classNameInput = document.getElementById('className');
  const generatedClassContainer = document.getElementById('generatedClassContainer');
  const copyButton = document.getElementById('copyButton');

  formatBtn.onclick = () => {
    let json;
    try {
      json = JSON.parse(inputArea.value);
      inputArea.value = JSON.stringify(json, null, 2);
    } catch (e) {
      alert('Invalid JSON: ' + e.message);
      return;
    }
    treeContainer.innerHTML = '';
    const tree = createTree(json);
    treeContainer.appendChild(tree);
  };

  function createTree(obj) {
    if (typeof obj !== 'object' || obj === null) {
      const span = document.createElement('span');
      span.textContent = obj === null ? 'null' : obj.toString();
      span.className = obj === null ? 'null' : typeof obj;
      return span;
    }

    const ul = document.createElement('ul');
    for (const key in obj) {
      const li = document.createElement('li');
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        li.innerHTML = '<span class="key collapsible">▶ ' + key + '</span>';
        const child = createTree(obj[key]);
        li.appendChild(child);
        li.classList.add('collapsed');

        li.querySelector('.collapsible').addEventListener('click', () => {
          li.classList.toggle('collapsed');
          li.querySelector('.collapsible').textContent = li.classList.contains('collapsed')
            ? '▶ ' + key
            : '▼ ' + key;
        });
      } else {
        const valSpan = document.createElement('span');
        valSpan.textContent = formatValue(obj[key]);
        valSpan.className = getTypeClass(obj[key]);
        li.innerHTML = '<span class="key">' + key + '</span>: ';
        li.appendChild(valSpan);
      }
      ul.appendChild(li);
    }
    return ul;
  }

  function formatValue(val) {
    if (val === null) return 'null';
    if (typeof val === 'string') return '"' + val + '"';
    return val.toString();
  }

  function getTypeClass(val) {
    if (val === null) return 'null';
    return typeof val;
  }

  generateBtn.onclick = () => {
    let json;
    try {
      json = JSON.parse(inputArea.value);
    } catch (e) {
      alert('Invalid JSON: ' + e.message);
      return;
    }
    const lang = langSelect.value;
    const rootClassName = classNameInput.value.trim() || 'RootClass';
    const code = generateFromJson(json, lang, rootClassName, 0);
    generatedClassContainer.style.display = 'block';
    copyButton.style.display = 'inline-block';
    generatedClassContainer.textContent = code;
  };

  copyButton.onclick = () => {
    vscode.postMessage({
      command: 'copy',
      text: generatedClassContainer.textContent
    });
  };

  // Generate class code with nested classes properly handled
  function generateFromJson(json, lang, className, level) {
    function indent(n) { return '  '.repeat(n); }
    function capitalize(str) { return str && str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

    function mapType(type) {
      const maps = {
        csharp: { string: 'string', number: 'double', boolean: 'bool', any: 'object' },
        java: { string: 'String', number: 'double', boolean: 'boolean', any: 'Object' },
        typescript: { string: 'string', number: 'number', boolean: 'boolean', any: 'any' }
      };
      return (maps[lang] && maps[lang][type.toLowerCase()]) || type;
    }

    function getType(value, key) {
      if (typeof value === 'string') return mapType('string');
      if (typeof value === 'number') return mapType('number');
      if (typeof value === 'boolean') return mapType('boolean');
      if (value === null) return mapType('any');
      if (Array.isArray(value)) {
        if (value.length === 0) {
          if (lang === 'typescript') return 'any[]';
          if (lang === 'csharp') return 'List<object>';
          return 'List<Object>';
        }
        const first = value[0];
        if (typeof first === 'object' && first !== null) {
          return lang === 'typescript'
            ? capitalize(key) + '[]'
            : 'List<' + capitalize(key) + '>';
        } else {
          return mapType(typeof first) + '[]';
        }
      }
      return capitalize(key);
    }

    let lines = [];
    let nestedClasses = [];

    if (lang === 'typescript') {
      lines.push(\`interface \${className} {\`);
      for (const key in json) {
        const val = json[key];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          nestedClasses.push(generateFromJson(val, lang, capitalize(key), level + 1));
          lines.push(\`  \${key}: \${capitalize(key)};\`);
        } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
          nestedClasses.push(generateFromJson(val[0], lang, capitalize(key), level + 1));
          lines.push(\`  \${key}: \${capitalize(key)}[];\`);
        } else {
          lines.push(\`  \${key}: \${getType(val, key)};\`);
        }
      }
      lines.push('}');
      return lines.concat(nestedClasses).join('\\n\\n');
    }

    // For C# and Java
    lines.push(indent(level) + \`public class \${className} {\`);
    for (const key in json) {
      const val = json[key];
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        lines.push(indent(level + 1) + \`public \${capitalize(key)} \${capitalize(key)} { get; set; }\`);
        nestedClasses.push(generateFromJson(val, lang, capitalize(key), level));
      } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
        lines.push(indent(level + 1) + \`public List<\${capitalize(key)}> \${capitalize(key)} { get; set; }\`);
        nestedClasses.push(generateFromJson(val[0], lang, capitalize(key), level));
      } else {
        lines.push(indent(level + 1) + \`public \${getType(val, key)} \${capitalize(key)} { get; set; }\`);
      }
    }
    lines.push(indent(level) + '}');

    return lines.concat(nestedClasses).join('\\n\\n');
  }
</script>
</body>
</html>
`;
}

export function deactivate() {}
