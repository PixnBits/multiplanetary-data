#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const glob = require('glob');

const rootPath = path.resolve(__dirname, '../');
glob(
  `${rootPath}/**/*.json`,
  { ignore: `${rootPath}/node_modules/**/*` },
  (globErr, jsonFilePaths) => {
    if (globErr) {
      throw globErr;
    }

    jsonFilePaths.forEach((jsonFilePath) => {
      fs.readFile(jsonFilePath, (readFileErr, jsonFileRaw) => {
        var data;

        try {
          data = `${JSON.stringify(
            JSON.parse(jsonFileRaw),
            null,
            2
          )}\n`;
        } catch (jsonError) {
          console.error(`error parsing/serializing JSON for ${jsonFilePath} (${jsonError.message})`);
          return;
        }

        console.log(`formatting and writing ${jsonFilePath.replace(rootPath, '')}`);

        fs.writeFile(
          jsonFilePath,
          data
        );
      });
    });
  }
);
