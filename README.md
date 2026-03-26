# Cosmos Rajesh Portfolio

Quick commands for local build and Firebase Hosting redeploy.

## Local Run

```powershell
npm install
npm run dev
```

## Production Build

```powershell
npm run build
```

## Quick Firebase Redeploy

Run from this folder:

`d:\IdeaProjects\protfolio\cosmos-protfolio\cosmos__rajesh_portfolio`

```powershell
npm run build
npx firebase-tools deploy --only hosting
```

## Firebase Project

- Project ID: `rajesh-portfolio-78`
- Hosting config: [firebase.json](d:/IdeaProjects/protfolio/cosmos-protfolio/cosmos__rajesh_portfolio/firebase.json)
- Project alias config: [.firebaserc](d:/IdeaProjects/protfolio/cosmos-protfolio/cosmos__rajesh_portfolio/.firebaserc)

## If Deploy Fails

Re-auth Firebase:

```powershell
npx firebase-tools login --reauth
```

Then redeploy:

```powershell
npx firebase-tools deploy --only hosting
```
