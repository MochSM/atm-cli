import { User, Debt } from '../interfaces/interface';
import { readFile, writeFile } from '../utils/iofs';

export const login = (name: string) => {
  const database = readFile();

  try {
    const datas = JSON.parse(database);
    let user = datas.data.find((user: User) => user.name === name);
    if (!user) {
      user = {
        name,
        balance: 0,
        debt: [],
      };
      datas.data.push(user);
    }
    datas.session = user;
    writeFile(JSON.stringify(datas));
    console.log(`Hello, ${user?.name}!`);
    console.log(`Your balance is $${user?.balance}`);
    user.debt.forEach((debt: Debt) => {
      if (!debt.isOwed) {
        console.log(`Owed $${debt.amount} from ${debt.name}`);
      } else {
        console.log(`Owed $${debt.amount} to ${debt.name}`);
      }
    });
  } catch (error) {
    console.error(error);
  }
};
