import { writeFile, readFile } from '../utils/iofs';

export const logout = () => {
  const database = readFile();
  const { session, data } = JSON.parse(database);

  if (!session) {
    console.log('You are not logged in');
    return;
  }

  writeFile(
    JSON.stringify({
      data,
      session: null,
    })
  );
  console.log(`Goodbye, ${session?.name}!`);
};
