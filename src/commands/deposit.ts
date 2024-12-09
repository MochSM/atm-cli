import { Debt, User } from '../interfaces/interface';
import { readFile, writeFile } from '../utils/iofs';

export const deposit = (amount: number) => {
  const database = readFile();
  const { session, data } = JSON.parse(database);

  if (!session) {
    console.log('You are not logged in');
    return;
  }

  const user = data.find((user: User) => user.name === session.name);
  if (!user) {
    console.log('User not found');
    return;
  }

  let depositAmount = Number(amount);

  // check if user have debt.
  const debts = user.debt.filter((debt: Debt) => debt.isOwed);
  for (const debt of debts) {
    const counterData = data.find((u: User) => u.name === debt.name);
    depositAmount -= debt.amount;
    if (depositAmount < 0) {
      const transferAmount = Number(debt.amount) + Number(depositAmount);
      debt.amount = Math.abs(depositAmount);
      // update counter data
      const counterDebt = counterData.debt.find(
        (d: Debt) => d.name === user.name
      );
      counterDebt.amount = Math.abs(depositAmount);
      data[data.indexOf(counterData)].debt[
        counterData.debt.indexOf(counterDebt)
      ] = counterDebt;
      user.debt[user.debt.indexOf(debt)] = debt;
      depositAmount = 0;
      console.log(`Transferred $${transferAmount} to ${debt.name}`);
      break; // now break works correctly
    } else {
      user.debt = user.debt.filter((d: Debt) => d.name !== debt.name);
      data[data.indexOf(counterData)].debt = counterData.debt.filter(
        (d: Debt) => d.name !== user.name
      );
      console.log(`Transferred $${debt.amount} to ${debt.name}`);
    }
  }

  user.balance = Number(user.balance) + depositAmount;
  data[data.indexOf(user)] = user;
  session.balance = user.balance;
  session.debt = user.debt;
  writeFile(JSON.stringify({ data, session }));
  console.log(`Your balance is $${user.balance}`);
  user.debt.forEach((debt: Debt) => {
    if (debt.isOwed) {
      console.log(`Owed $${Math.abs(debt.amount)} to ${debt.name}`);
    } else {
      console.log(`Owed $${debt.amount} from ${debt.name}`);
    }
  });
};
