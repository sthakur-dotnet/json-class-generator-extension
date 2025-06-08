# JSON Class Generator Extension

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/SuvankarThakur.json-class-generator?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=SuvankarThakur.json-class-generator)

View JSON tree and generate C#, Java, TypeScript classes from JSON inside VS Code.

## Features

- **Visualize JSON:** Quickly view JSON structures as an interactive tree.
- **Generate Classes:** Instantly generate class definitions from JSON for:
  - C#
  - Java
  - TypeScript
- **VS Code Integration:** Simple command to open the generator from the command palette.

## Getting Started

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/) version 1.60.0 or newer.

### Installation

Install directly from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=SuvankarThakur.json-class-generator):

1. Open the Extensions sidebar in VS Code (`Ctrl+Shift+X`).
2. Search for `JSON Class Generator`.
3. Click **Install**.

Or, visit the [Marketplace page](https://marketplace.visualstudio.com/items?itemName=SuvankarThakur.json-class-generator) and click **Install**.

## Usage

1. Open a JSON file in VS Code.
2. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
3. Type `JSON: Format & Generate Classes` and select the command.
4. View the JSON as a tree and generate class code in your desired language.

## Commands

- `JSON: Format & Generate Classes` (`jsonClassGenerator.open`): Launch the main generator interface.

## Development

- Clone this repository
- Install dependencies: `npm install`
- Build: `npm run compile`
- Watch: `npm run watch`
- Press `F5` to launch the extension in a new Extension Development Host window

## Contributing

Feel free to submit issues or pull requests to improve functionality or add new features.

## License

[MIT License](LICENSE)

---

**Author:** [sthakur-dotnet](https://github.com/sthakur-dotnet)
