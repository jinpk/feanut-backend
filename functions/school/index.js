import xlsx from 'xlsx';
import mongoose from 'mongoose';
import fs from 'fs';
import * as readline from 'readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const School = mongoose.model('School', {
  sido: String,
  sigungu: String,
  level: String,
  name: String,
  zipcode: String,
  address: String,
  code: String,
  campus: String,
});

const uploadSchool = async () => {
  try {
    const mongouri = await rl.question('mongo uri? ');
    if (!mongouri) {
      throw 'Please input mongodb uri for first argument';
    }
    mongoose.connect(mongouri);
    const yn = await rl.question('are you sure want continue (y|n)? ');
    if (yn !== 'y') return;

    const xlsxPath = await rl.question('schhol xlsx file path? ');
    if (!xlsxPath) {
      throw 'Please input xlsxPath for third argument';
    }

    const excelFile = xlsx.readFile(xlsxPath);

    const sheetName = excelFile.SheetNames[0];
    const firstSheet = excelFile.Sheets[sheetName];
    let jsonData = xlsx.utils.sheet_to_json(firstSheet, { defval: '' });

    const levels = new Set();

    jsonData = jsonData
      .map((element, index) => {
        let code = index + 1;
        element.code = `FS${code}`;
        element.zipcode = element.zipcode?.replace(/-/g, '').trim();
        element.address = element.address?.replace(/-/g, '').trim();
        levels.add(element.level);
        return element;
      })
      .filter((x) =>
        x.level === '유치원' || x.level === '초등학교' ? false : true,
      );

    await School.deleteMany({});
    await School.insertMany(jsonData);
    console.log('Succesfully update school', result);
  } catch (error) {
    console.error(error);
  }
  process.exit(1);
};

const uploadUniversity = async () => {
  try {
    const mongouri = await rl.question('mongo uri? ');
    if (!mongouri) {
      throw 'Please input mongodb uri for first argument';
    }
    mongoose.connect(mongouri);
    const yn = await rl.question('are you sure want continue (y|n)? ');
    if (yn !== 'y') return;

    const jsonPath = await rl.question('university json file path? ');
    if (!jsonPath) {
      throw 'Please input xlsxPath for third argument';
    }

    let jsonData = JSON.parse(fs.readFileSync(jsonPath));
    jsonData = jsonData.map((element, index) => {
      element.code = `FU${index + 1}`;
      element.zipcode = undefined;
      element.address = undefined;
      element.campus = element.campus || undefined;
      const [sido, sigungu] = element.location?.split(' ');
      element.sido = sido || undefined;
      element.sigungu = sigungu || undefined;
      element.level = element.type;
      delete element.type;
      delete element.location;
      return element;
    });

    await School.deleteMany({ code: { $regex: 'FU', $options: 'i' } });
    const result = await School.insertMany(jsonData);
    console.log('Succesfully update university', result);
  } catch (error) {
    console.error(error);
  }
  process.exit(1);
};

const args = process.argv.slice(2);

switch (args[0]) {
  case 'school':
    uploadSchool();
  case 'university':
    uploadUniversity();
    break;
  default:
    console.error('invalid function call');
    process.exit(1);
}
