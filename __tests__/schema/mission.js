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

    // parse here to give the user some information on where the error is
    let missionData;
    try {
      missionData = JSON.parse(missionDataRaw);
    } catch (jsonParseError) {
      if (!(jsonParseError instanceof SyntaxError)) {
        throw jsonParseError;
      }

      const positionMatch = /at position (\d*)/.exec(jsonParseError.message);

      if (!positionMatch) {
        throw jsonParseError;
      }

      const position = parseInt(positionMatch[1], 10);

      // could be nicer to memory by using the buffer data directly
      const lines = missionDataRaw
        .slice(0, position)
        .toString()
        .split(/(?:\n|\r)/);
        // .filter(Boolean);
      const lineCount = lines.length;
      const lastLine = lines.pop();
      const charCount = lastLine.length;

      let offset = 5;
      let rawJsonSegment;
      do {
        rawJsonSegment = `${missionDataRaw.slice(position - offset, position)}»${missionDataRaw.slice(position, position + 1)}«${missionDataRaw.slice(position + 1, position + offset)}`;
        offset += 5;
      } while (rawJsonSegment.replace(/\s/g,'').length < 50 && (offset * 2 <= missionDataRaw.length))

      throw new SyntaxError(`${jsonParseError.message} (line ${lineCount} char ${charCount})\n…${rawJsonSegment}…`);
    }

    t.is(
      missionDataRaw.toString(),
      `${JSON.stringify(
        missionData,
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
