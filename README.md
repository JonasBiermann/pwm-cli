# PWM (Password Manager CLI) by Jonas Biermann

PWM is a command-line password manager tool that allows you to manage your passwords securely from the terminal without the need to use your mouse!

## Installation

### Dependencies

First, if its not already installed you need to install [NodeJS](https://nodejs.org/en/download) from the official website.

To use PWM follow these steps:

1. Clone the repository to your local machine:

   `git clone https://github.com/JonasBiermann/pwm-cli.git `

2. Navigate to the project directory (either in Terminal using `cd` or opening in VSCode):

   `cd pwm-cli`

3. Install the project dependencies:

   `npm install -g .`

4. Run PWM:

   `pwm`

This CLI requires the following dependencies.

- @clack
- chalk
- clipboardy
- crypto
- yargs

If these dependencies are not installed on your machine or if you encounter any installation errors, run `npm install <dependecy>` in your terminal.

## Commands

PWM supports the following commands:

- `pwm logout`: Logout the current user.
- `pwm auth`: Authenticate the user.
- `pwm add`: Add a new password.
- `pwm generate`: Generate a secure password.
- `pwm show-all`: Show a list of stored passwords for websites.
- `pwm search`: Search for a specific password by website.

If you need help or want to check the current version use the following commands:

- `pwm --help`
- `pwm --version`

## Usage

To use a command, run `pwm <command>`. For example:
`pwm add`.
For more details on each command and its options, run `pwm --help`.
The use of `Ctrl+C` aborts any process in the program.

Currently it is not possible to run the CLI globally on your system. Therefore, you need to always navigate to the `pwm-cli` directory to interact with the CLI.

# Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request.

# License

This project is licensed under the MIT License.
