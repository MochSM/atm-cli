import { readFile, writeFile } from '../utils/iofs';

export const withdraw = (amount: number) => {
  const database = readFile();
  const { session, data } = JSON.parse(database);

  if (!session) {
    console.log('You are not logged in');
    return;
  }

  const user = data.findIndex((user: any) => user.name === session.name);
  if (user === -1) {
    console.log('User not found');
    return;
  }

  if (Number(data[user].balance) < Number(amount)) {
    console.log('You do not have enough balance');
    return;
  }

  data[user].balance = Number(data[user].balance) - Number(amount);
  session.balance = data[user].balance;
  writeFile(JSON.stringify({ data, session }));
  console.log(`Your balance is $${data[user].balance}`);
};
