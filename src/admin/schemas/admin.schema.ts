import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { compareSync, genSalt, hash } from 'bcrypt';

export type AdminDocument = HydratedDocument<Admin & AdminMethods>;

@Schema({ timestamps: true })
export class Admin {
  @Prop()
  username: string;

  @Prop()
  password: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  genSalt()
    .then((salt) => {
      hash(this.password, salt)
        .then((hashed) => {
          this.password = hashed;
          next();
        })
        .catch((err) => {
          console.error('hash user password (2): ', err);
          next(new Error('암호화 오류'));
        });
    })
    .catch((err) => {
      console.error('hash user password (1): ', err);
      next(new Error('암호화 오류'));
    });
});

interface AdminMethods {
  comparePassword?: (password: string) => Promise<boolean>;
}

AdminSchema.methods.comparePassword = async function (password) {
  return compareSync(password, this.password);
};
