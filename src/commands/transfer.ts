import { Debt } from '../interfaces/interface';
import { readFile, writeFile } from '../utils/iofs';

export const transfer = (name: string, amount: number) => {
  const database = readFile();
  const { session, data } = JSON.parse(database);

  if (!session) {
    console.log('You are not logged in');
    return;
  }

  const user = data.find((user: any) => user.name === session.name);
  const target = data.find((user: any) => user.name === name);
  if (!user || !target) {
    console.log('User not found');
    return;
  }

  if (user.name === target.name) {
    console.log('Target cannot be the same as user');
    return;
  }

  let transferAmount = Number(amount);

  // check if before has debt
  const debt = user.debt.find((debt: Debt) => debt.name === target.name);
  if (debt && !debt.isOwed) {
    const targetDebt = target.debt.find(
      (debt: Debt) => debt.name === session.name
    );
    transferAmount -= Number(debt.amount);
    if (transferAmount < 0) {
      // update saldo, return.
      debt.amount = Math.abs(transferAmount);
      targetDebt.amount = Math.abs(transferAmount);

      user.debt[user.debt.indexOf(debt)] = debt;
      target.debt[target.debt.indexOf(targetDebt)] = targetDebt;
      transferAmount = 0;
    } else {
      // remove debt
      user.debt = user.debt.filter((debt: Debt) => debt.name !== target.name);
      target.debt = target.debt.filter(
        (debt: Debt) => debt.name !== session.name
      );
    }
  }

  // end Check

  const userBalance = Number(user.balance) - transferAmount;
  const targetBalance = Number(target.balance) + transferAmount;

  if (userBalance < 0) {
    const absUserBalance = Math.abs(userBalance);
    // check if user has debt
    const debt = user.debt.find((debt: Debt) => debt.name === target.name);
    if (debt) {
      debt.amount = debt.amount + absUserBalance;
    } else {
      user.debt.push({
        name: target.name,
        isOwed: true,
        amount: absUserBalance,
      });
    }
    // update target debt
    const targetDebt = target.debt.find(
      (debt: Debt) => debt.name === session.name
    );
    if (targetDebt) {
      targetDebt.amount = targetDebt.amount + absUserBalance;
    } else {
      target.debt.push({
        name: session.name,
        isOwed: false,
        amount: absUserBalance,
      });
    }

    // update debt
    user.balance = 0;
    user.debt[user.debt.indexOf(debt)] = debt;
    target.balance =
      Number(target.balance) + (Number(amount) + Number(userBalance));
    target.debt[target.debt.indexOf(targetDebt)] = targetDebt;
  } else {
    user.balance = userBalance;
    target.balance = targetBalance;
  }

  data[data.indexOf(user)] = user;
  data[data.indexOf(target)] = target;

  session.balance = user.balance;
  session.debt = user.debt;
  writeFile(JSON.stringify({ data, session }));
  console.log(
    `Transferred $${
      userBalance < 0 ? Number(amount) + Number(userBalance) : amount
    } to ${name}`
  );
  console.log(`Your balance is $${user.balance}`);
  user.debt.forEach((debt: Debt) => {
    if (debt.isOwed) {
      console.log(`Owed $${Math.abs(debt.amount)} to ${debt.name}`);
    } else {
      console.log(`Owed $${debt.amount} from ${debt.name}`);
    }
  });
};
