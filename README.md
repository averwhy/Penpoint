# Pride25
Lightweight college event 'pride' point system

> [!NOTE]
> Pride25 is under active development!

## Setup
Pride25 was made with ease of setup in mind. Nuxt, the framework used for this site, combines the website and server so that you only need one server to run it.

| Step | Link | Required? |
| ------------- | ------------- | -- |
| 1 | [Cloning](#cloning)  | ✅ |
| 2  | [Cloudflare](#cloudflare)  | ✅ |
| 3 | [Configuration](#configuration) | ✅ |

> [!CAUTION]
> The setup guide is a work in progress, as is Pride25.

### Cloning
To clone this code to your server where you'll be running Pride25, you'll need to install Git. The installation process depends slightly on what operating system the server is running. [Check out the Git website to view the options.](https://git-scm.com/downloads)

Once git is installed, run this command in the command line interface:
```
git clone https://github.com/averwhy/Pride25.git
```
This downloads the website to your local server.

### Cloudflare
You will need to make a [Cloudflare](https://dash.cloudflare.com/sign-up) account to set up the database used with Pride25.

Once you are signed up, you'll need to create a Cloudflare D1 SQL Database.
1. In the [Dashboard](https://dash.cloudflare.com), navigate to **Storage & Databases**.
2. Expand the list and click on **D1 SQL Database**.
3. Create a database and name it something like `pride25`.

After that, you'll need to grab the api URL blah blah blah **TODO**.

### Configuration
To configure Pride25, navigate to the `.example.env` file and rename it to `.env`. This file will contain **very sensitive** information, so you want to keep it safe by just keeping it here on the local server.

*Todo: example env file*
