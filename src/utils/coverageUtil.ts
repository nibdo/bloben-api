/* eslint-disable no-console */
import { forEach, some } from 'lodash';

import fs from 'fs';
import util from 'util';

const readdir: any = util.promisify(fs.readdir);

const BASE_DIR = './src/api';
const TEST_DIR = './src/test/integration/app/api';

const getFiles = async (
  dir: string,
  pathBefore: string,
  pathAfter: string,
  endIndex: number
): Promise<string[]> => {
  const result: string[] = [];

  const files: any = await readdir(dir);

  const promises: any = [];

  forEach(files, (file: string) => {
    promises.push(
      readdir(`${pathBefore}/${file}${pathAfter !== '' ? pathAfter : ''}`)
    );
  });

  // @ts-ignore
  const fileHandlers: any = await Promise.all(promises);

  forEach(fileHandlers, (fileHandler: any) => {
    forEach(fileHandler, (file: string) => {
      result.push(file.slice(0, endIndex));
    });
  });

  return result;
};

export const coverageTestUtil = async () => {
  const apiFiles: string[] = await getFiles(
    BASE_DIR,
    BASE_DIR,
    '/handlers',
    -3
  );
  const testFiles: string[] = await getFiles(TEST_DIR, TEST_DIR, '', -8);

  const errors: string[] = [];

  // check if each api file has test
  forEach(apiFiles, (apiFile: string) => {
    const someResult = some(testFiles, (testFile: string) => {
      return testFile === apiFile;
    });

    if (!someResult) {
      errors.push(apiFile);
    }
  });

  console.log('\n');
  console.log('[INFO] MISSING TESTS FOR');
  console.log(errors);
  console.log('\n');
};
