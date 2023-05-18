import mongoose from 'mongoose';
import * as readline from 'readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const updateIsLegacyTrue = async () => {
  try {
    const mongouri = await rl.question('mongo uri? ');
    if (!mongouri) {
      throw 'Please input mongodb uri for first argument';
    }
    mongoose.connect(mongouri);
    const yn = await rl.question(
      'are you sure want change isLegacy key value to true (y|n)? ',
    );
    if (yn !== 'y') return;

    const result = await mongoose.connection.db
      .collection('friendships')
      .updateMany(
        {},
        {
          $set: {
            isLegacy: true,
          },
        },
      );

    console.log("Succesfully update isLegacy field to 'true'.", result);
  } catch (error) {
    console.error(error);
  }
  process.exit(1);
};

updateIsLegacyTrue();
