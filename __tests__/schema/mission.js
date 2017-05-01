// native
import fs from 'fs';
import path from 'path';

// registry
import test from 'ava';
import Ajv from 'ajv';
import glob from 'glob';

// package
import schema from './mission.json';

const organizationsPath = path.resolve(__dirname, '../../');

// TODO: does ava allow for async test definition?
// (use `glob(...)` instead of `glob.sync(...)`)
const missionsPaths = glob.sync(`${organizationsPath}/*/missions/*/*.json`);
missionsPaths.forEach((missionPath) => {
  const missionPathProject = missionPath.replace(organizationsPath, '');

  test(`${missionPathProject}: formatting`, t => {
    // FIXME: do this async, but the ava way (full ES2017)
    const missionDataRaw = fs.readFileSync(missionPath);
    t.is(
      missionDataRaw.toString(),
      `${JSON.stringify(
        JSON.parse(missionDataRaw),
        null,
        2
      )}\n`
    );
  });

  test(`${missionPathProject}: json-schema`, t => {
    const missionData = require(missionPath);
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var valid = ajv.validate(schema, missionData);
    t.is(ajv.errors, null);
  });
});
