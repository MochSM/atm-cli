import { Command } from 'commander';
import { login, logout, deposit, withdraw, transfer } from './commands';

function main() {
  const program = new Command();
  program.name('atm-cli').version('1.0.0').description('ATM CLI');

  program.command('login <user>').description('Login to the ATM').action(login);
  program.command('logout').description('Logout from the ATM').action(logout);
  program
    .command('deposit <amount>')
    .description('Deposit money to the ATM')
    .action(deposit);
  program
    .command('withdraw <amount>')
    .description('Withdraw money from the ATM')
    .action(withdraw);
  program
    .command('transfer <name> <amount>')
    .description('Transfer money to the user')
    .action(transfer);

  program.parse(process.argv);
}

main();
