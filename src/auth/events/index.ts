export class PhoneNumberLoginEvent {
  constructor(private phoneNumber: string, private code: string) {}
}

export class EmailLoginEvent {
  constructor(private email: string, private code: string) {}
}
