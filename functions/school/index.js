const xlsx = require('xlsx');
const mongoose = require('mongoose');
const host = 'mongodb://api:randomepassword@34.64.153.103:27017/feanut';
mongoose.connect(host);

const School = mongoose.model('School', {
  sido: String,
  sigungu: String,
  level: String,
  name: String,
  zipcode: String,
  address: String,
  code: String,
});
const excelFile = xlsx.readFile('./전국학교.xlsx');

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

School.deleteMany({}).then((a) => {
  console.log('del all');
  School.insertMany(jsonData)
    .then((a) => {
      console.log('cr all');
    })
    .catch((e) => {
      console.log(e);
    });
});
