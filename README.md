# Penpoint

![GitHub package.json dynamic](https://img.shields.io/github/package-json/version/averwhy/penpoint?style=flat-square&color=darkgreen)
![GitHub License](https://img.shields.io/github/license/averwhy/penpoint?style=flat-square)
![GitHub language count](https://img.shields.io/github/languages/count/averwhy/penpoint?style=flat-square)
![GitHub top language](https://img.shields.io/github/languages/top/averwhy/penpoint?style=flat-square)
![GitHub issue custom search in repo](https://img.shields.io/github/issues-search/averwhy/penpoint?query=open%3Atrue&style=flat-square&label=open%20issues&color=yellow)
![GitHub watchers](https://img.shields.io/github/watchers/averwhy/penpoint?style=flat-square)

A lightweight yet robust event point tracking system, built around college clubs. Made for the Southern New Hampshire University Student Government Association for their Penmen Pride program.

It utilizes Apple Wallet & Google Wallet mobile passes with unique QR codes to enable students to earn points for attending events.

Penpoint is built with the Svelte 5, utilizing remote functions for a typesafe API.

## Setup
Penpoint was made with ease of setup in mind. Svelte, the framework used for this site, combines the website and backend, so you'll only have to setup the website, and then the database.

> [!CAUTION]
> The setup guide is a work in progress, as is Penpoint.

#### Prerequisites
- Git
- Node.js 20.0.0 or higher
- Docker/Docker engine installed and running
- Apple Developer Account (for Apple Wallet)
- Google Developer Account (for Google Wallet)
- Some bluetooth/usb scanner for scanning QR codes (optional, but recommended)
- [Bun](https://bun.sh/) (optional, but recommended)

### Prepartion
1. Clone the repository to your local machine.
```
git clone https://github.com/averwhy/Penpoint.git
```

2. Navigate to the project directory.
```
cd Penpoint
```

3. Install the dependencies.
```
bun install
```

4. Rename the `.env.example` file to `.env` and fill in the required environment variables.
> [!WARNING]
> For production, use a cryptographically secure 64-character string for the three JWT secrets. You can generate one using the following command: `openssl rand -base64 48`.
> Store these secrets securely, as they are used to sign and verify JWT tokens for authentication.

5. Spin up the database using Docker.
> [!TIP]
> Add the `-d` flag to the end of the below command to run the database in detached mode, allowing you to continue using the terminal for other commands. If you don't, note that if you close that terminal the database will stop.
```
docker compose up
```
The database will be created automatically and filled with the necessary tables.

6. Build the site.
```
bun run build
```

7. Start the site.
```
bun run start
```