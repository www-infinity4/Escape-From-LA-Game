# Escape from L.A. – Snake Plissken's Escape

A browser-based top-down action game inspired by the cancelled video game adaptation of John Carpenter's 1996 film *Escape from L.A.* The planned game — sometimes titled *Snake Plissken's Escape* — was announced for Sega Saturn, PlayStation, and PC but was never released. This project builds that game.

## Story

Year 2013. Los Angeles has been declared a maximum-security prison island following a catastrophic earthquake. Snake Plissken is sent in to retrieve the **Sword of Damocles** — a superweapon capable of shutting down every electronic system on Earth. Fight through hostile gang territory, secure the weapon, then reach the extraction point alive.

## How to Play

Open `index.html` in any modern web browser. No build step or server required.

| Input | Action |
|---|---|
| `W` / `A` / `S` / `D` or Arrow Keys | Move Snake |
| Mouse (aim) + Left Click | Shoot |
| `Spacebar` | Shoot (toward aimed direction) |
| `Enter` | Start / Restart |

### Objectives

1. Navigate the walled city, collecting **health packs** (+) and **ammo packs** (A).
2. Find the glowing **★ Sword of Damocles** in the centre of the map.
3. After securing it, reach the blinking **⊕ extraction point** in the top-right sector to escape and win.

### Tips

- Enemies start patrolling and switch to **chase mode** when you get close.
- Corners and doorways give you cover from enemy fire.
- Watch your ammo — pick up blue **A** packs before running dry.
- The extraction point is always visible in the top-right; it pulses brightly once the objective is secured.

## Android Build

The game can be packaged as an Android APK using [Capacitor](https://capacitorjs.com/).  
A GitHub Actions workflow (`.github/workflows/build-android.yml`) automatically builds a debug APK on every push/PR to `main`/`master`.

### Download the APK

After the **Build Android APK** workflow completes, the debug APK is available as a workflow artifact named `escape-from-la-debug` on the Actions tab.

### Build locally

Requirements: Node.js 22+, Android Studio with Android SDK installed, Java 17.

```bash
npm install
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Files

| File | Purpose |
|---|---|
| `index.html` | Game entry point |
| `game.js` | All game logic (single self-contained script) |
| `capacitor.config.json` | Capacitor configuration for Android packaging |
| `package.json` | Node.js project manifest with Capacitor dependencies |
| `.github/workflows/build-android.yml` | CI workflow that builds the Android APK |

## Background

A *Snake Plissken's Escape* video game was announced for Sega Saturn, PlayStation, and PC in the mid-1990s as a 3D action game based on the film, but was cancelled before release. The film itself — a sequel to *Escape from New York* — has had a lasting influence on gaming, notably inspiring Hideo Kojima's *Metal Gear Solid* series (Solid Snake's name and design are a direct nod to Snake Plissken). This project is a fan-made tribute built in the spirit of that cancelled game.
