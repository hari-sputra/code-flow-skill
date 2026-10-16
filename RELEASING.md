# RELEASING — Panduan CLI Rilis & Publish

Panduan command-by-command untuk merilis versi baru `code-flow-skill`. Simpan/buka file ini kapan pun butuh.

Repo ini memegang dua hal sekaligus:
- **Installer** (`src/`) → dipublish ke npm.
- **Snapshot rules** (`skills/` + `skills/index.json`) → di-fetch consumer saat `install`.

---

## TL;DR — rilis normal (otomatis via CI)

```powershell
cd C:\Users\LOQ\Documents\development\code-flow-skill

npm run release -- patch   # bump 0.1.0 -> 0.1.1 + sync manifest + commit (TANPA tag)
git push                   # CI bikin tag + GitHub Release + npm publish
```

Pilihan bump:

```powershell
npm run release -- patch   # 0.1.0 -> 0.1.1  (bugfix / perubahan kecil)
npm run release -- minor   # 0.1.0 -> 0.2.0  (fitur baru, backward compatible)
npm run release -- major   # 0.1.0 -> 1.0.0  (breaking change)
npm run release -- 1.4.2   # set versi eksplisit
```

Setelah `git push`, cek tab **Actions** di GitHub:
1. `tag-and-release.yml` → bikin tag `vX.Y.Z` + Release.
2. `release.yml` → test + build + `npm publish`.

Verifikasi hasil:

```powershell
npm view code-flow-skill version        # harus = versi baru
```

---

## Alur lengkap kalau rules berubah (dari Obsidian)

Rules diedit di Obsidian lalu di-generate oleh project `agent-skills`. Urutannya:

```powershell
# 1. Di project agent-skills: build + salin snapshot ke repo ini
cd C:\Users\LOQ\Documents\agent-skills
npm run build
npm run publish-skills -- --version v0.2.0      # samakan dgn versi rilis berikutnya

# 2. Di repo code-flow-skill: commit snapshot baru
cd C:\Users\LOQ\Documents\development\code-flow-skill
git add skills
git commit -m "rules: update skills snapshot"

# 3. Rilis
npm run release -- minor      # bump + sync manifest + commit
git push                      # CI tag + release + publish
```

> Catatan: `skills/index.json` "version" otomatis disamakan dengan `package.json` oleh `npm run release`.

---

## MANUAL — push bersama tag (fallback, kalau tidak pakai CI)

Kalau Anda mau bikin tag sendiri dari CLI dan push sekaligus (tanpa menunggu `tag-and-release.yml`):

```powershell
cd C:\Users\LOQ\Documents\development\code-flow-skill

# 1. bump versi + bikin commit + tag lokal sekaligus (npm bawaan)
npm version patch            # bikin commit "0.1.1" + tag v0.1.1 lokal
#    (minor / major / 1.4.2 juga bisa)

# 2. push branch DAN tag bersamaan
git push --follow-tags
#    atau eksplisit:
#    git push && git push origin v0.1.1
```

- `git push --follow-tags` mendorong commit + semua tag beranotasi yang menunjuk commit ter-push. Ini cara "push bersama tag" yang paling bersih.
- Begitu tag `vX.Y.Z` muncul di GitHub, Anda cukup **buat Release dari tag itu** (web atau `gh release create vX.Y.Z --generate-notes`) untuk memicu `release.yml` → npm publish.

> PERHATIAN: Jangan campur `npm version` (yang bikin tag lokal) dengan `npm run release` (yang sengaja TIDAK bikin tag) di satu rilis — nanti tag dobel. Pilih **satu** jalur:
> - Jalur otomatis → `npm run release -- <bump>` + `git push`.
> - Jalur manual → `npm version <bump>` + `git push --follow-tags` + buat Release.

---

## Tag manual murni (tanpa npm version)

Kalau versi `package.json` sudah benar dan Anda hanya mau menandai commit sekarang:

```powershell
git tag -a v0.1.1 -m "v0.1.1"      # tag beranotasi
git push origin v0.1.1              # push tag itu saja
# atau commit + tag sekaligus:
git push --follow-tags
```

---

## Publish manual (fallback terakhir, tanpa CI)

Kalau CI mati dan harus publish dari laptop:

```powershell
cd C:\Users\LOQ\Documents\development\code-flow-skill
npm run build
npm publish --access public --otp=123456     # ganti 123456 dgn kode authenticator
```

Kalau akun pakai token granular (bypass 2FA):

```powershell
$env:NODE_AUTH_TOKEN="<granular-token>"
npm publish --access public
```

---

## Cek status

```powershell
npm view code-flow-skill version          # versi latest di npm
npm view code-flow-skill versions         # semua versi
git tag --list                            # tag lokal
git ls-remote --tags origin               # tag di GitHub
```

---

## Prasyarat sekali-pasang

- Secret repo GitHub `NPM_TOKEN` (Granular Access Token, write + bypass 2FA) di
  Settings → Secrets and variables → Actions. Dipakai oleh `release.yml`.
- Node 18+ dan sudah `git remote` ke `hari-sputra/code-flow-skill`.
