# EcoFarm Connect — Pro starter

Սա EcoFarm Connect-ի ամբողջական, կապակցված frontend + Node/Express + Firebase starter-ն է։

## 1. Firebase
1. Firebase Console → ստեղծեք project։
2. Authentication → Sign-in method → միացրեք Email/Password և Google։
3. Firestore Database → ստեղծեք database։
4. Project settings → Web app → պատճենեք config-ը `firebase-config.js`։
5. Firestore Rules-ը փոխարինեք `firestore.rules`-ի կանոններով։
6. Project settings → Service accounts → ստեղծեք private key և պահեք որպես `serviceAccountKey.json` (մի հրապարակեք GitHub-ում)։

## 2. Email 6-նիշ OTP
`cp .env.example .env` և լրացրեք SMTP տվյալները։
Gmail-ի դեպքում օգտագործեք App Password, ոչ թե սովորական գաղտնաբառ։

## 3. Run
```bash
npm install
npm run dev
```
Բացեք `http://localhost:3000`.

## 4. Իրական վճարում
`card.html`-ը հիմա անվտանգ demo checkout է․ այն չի գանձում իրական քարտից։ Իրական վճարման համար պետք է միացնել ձեր բանկի/վճարային պրովայդերի merchant API-ն backend-ում։ Քարտի համար/CVV-ը server-ում կամ Firestore-ում չպահել։

## 5. SMS
Profile-ի phone verification-ի endpoint-ը պատրաստ է Twilio-ի համար։ `.env`-ում լրացրեք TWILIO_* արժեքները։
