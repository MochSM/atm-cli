import fs from 'fs';

// write to /src/storage/data.json
export const writeFile = (content: string) => {
  fs.writeFileSync('./src/storage/data.json', content);
};

// read from /src/storage/data.json
export const readFile = () => {
  return fs.readFileSync('./src/storage/data.json', 'utf8');
};
