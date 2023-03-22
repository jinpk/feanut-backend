import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { SECURITY_ENCRYPT_ALGORITHM } from '../common.constant';

@Injectable()
export class SecuriryService {
  private readonly logger = new Logger(SecuriryService.name);
  private readonly securityKey: Buffer;

  constructor(private configService: ConfigService) {
    this.securityKey = Buffer.from(this.configService.get('securityKey'));
  }

  encrypt(plainText: string) {
    return plainText;
    const iv = randomBytes(16);

    const cipher = createCipheriv(
      SECURITY_ENCRYPT_ALGORITHM,
      this.securityKey,
      iv,
    );

    const encrypted = cipher.update(plainText);

    return (
      iv.toString('hex') +
      ':' +
      Buffer.concat([encrypted, cipher.final()]).toString('hex')
    );
  }

  decrypt(encryptedPlainText: string) {
    return encryptedPlainText;
    const textParts = encryptedPlainText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = createDecipheriv('aes-256-cbc', this.securityKey, iv);
    const decrypted = decipher.update(encryptedText);

    return Buffer.concat([decrypted, decipher.final()]).toString();
  }
}
