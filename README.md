# Todo App

A simple Todo application built with React. This application allows users to create, edit, and delete tasks, with features for error handling and retry logic.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Contributing](#contributing)

## Introduction

This Todo application helps users manage their tasks efficiently. Users can add new tasks, mark them as completed, and delete them as needed. The application also includes error handling for network issues and provides feedback to users.

## Features

- Create, edit, and delete tasks
- Error handling for network issues
- User feedback for actions
- Responsive design

## Installation

To install the project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/heeeyeon/to-do-list.git
   ```
2. Navigate to the project directory:
   ```bash
   cd todo-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

To use the application, run the following command to start the development server:

```bash
npm start
```

Open your browser and navigate to `http://localhost:3000` to view the application.

## Scripts

This project includes several scripts for development and testing:

- **Start**: `npm start` - Starts the JSON server and serves the static files.
- **Test**: `npm test` - Runs the tests using Jest.
- **Test Watch**: `npm run test:watch` - Runs tests in watch mode.
- **Test Coverage**: `npm run test:coverage` - Generates a coverage report.
- **Lint**: `npm run lint` - Runs ESLint to check for code quality.
- **Lint Fix**: `npm run lint:fix` - Automatically fixes linting issues.
- **Format**: `npm run format` - Formats the code using Prettier.
- **Stylelint**: `npm run stylelint` - Checks CSS/SCSS files for style issues.
- **Stylelint Fix**: `npm run stylelint:fix` - Automatically fixes style issues.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/YourFeature`)
6. Open a pull request
