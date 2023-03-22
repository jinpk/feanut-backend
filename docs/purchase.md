# Purchase

## In APP Purchase

Flow

1. 앱에서 Consumable Purchase 요청

2. 구글/앱스토어 서버에서 purchaseData(Token(Google) | Receipt(Apple)) 발급받음

3. productId, packageName | bundleId, purchaseData 포함하여 서버로 검증 요청

4. 서버에서 OS별 purchaseData를 검증

   - 검증
     1. 해당 purchaseData를 이미 이전에 사용한적 없는지
     2. 각 OS 결제 서버에서 유효한 결제인지

5. productId와 결제 지급 상품을 맵핑하여 후처리 (feanut coin 충전 등)

6. API Successfully responsed

### Android

#### Product Ids

- `feanut.iap.coin.5` - 5개

- `feanut.iap.coin.10` - 10개

- `feanut.iap.coin.30` - 30개

- `feanut.iap.coin.50` - 50개

- `feanut.iap.coin.100` - 100개

### iOS

#### Product Ids

- `feanut.iap.coin.5` - 5개

- `feanut.iap.coin.10` - 10개

- `feanut.iap.coin.30` - 30개

- `feanut.iap.coin.50` - 50개

- `feanut.iap.coin.100` - 100개
