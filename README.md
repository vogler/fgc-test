<p align="center">
<img alt="logo-free-games-claimer" src="https://user-images.githubusercontent.com/493741/214588518-a4c89998-127e-4a8c-9b1e-ee4a9d075715.png" />
</p>

# free-games-claimer

Claims free games periodically on
- <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg" width="32"/> [Epic Games Store](https://www.epicgames.com/store/free-games)
- <img src="https://seeklogo.com/images/P/prime-gaming-logo-61A701B3F5-seeklogo.com.png" width="32"/> [Amazon Prime Gaming](https://gaming.amazon.com)
- <img src="https://static.wikia.nocookie.net/this-war-of-mine/images/1/1a/Logo_GoG.png/revision/latest?cb=20160711062658" width="32"/> [GOG](https://www.gog.com)
- <img src="https://www.freepnglogos.com/uploads/xbox-logo-picture-png-14.png" width="32"/> [Xbox Live Games with Gold](https://www.xbox.com/en-US/live/gold#gameswithgold) - planned

Pull requests welcome :)

![Telegram Screenshot](https://user-images.githubusercontent.com/493741/214667078-eb5c1877-2bdd-40c1-b94e-4a50d6852c06.png)

_Works on Windows/macOS/Linux._

Raspberry Pi (3, 4, Zero 2): [requires 64-bit OS](https://github.com/vogler/free-games-claimer/issues/3) like Raspberry Pi OS or Ubuntu (Raspbian won't work since it's 32-bit).

## How to run
Easy option: [install Docker](https://docs.docker.com/get-docker/) (or [podman](https://podman-desktop.io/)) and run this command in a terminal (Windows: `cmd`, `.bat` file):
```
docker run --rm -it -p 6080:6080 -v fgc:/fgc/data --pull=always ghcr.io/vogler/free-games-claimer
```
This will run `node epic-games; node prime-gaming; node gog` - if you only want to claim games for one of the stores, you can override the default command by appending e.g. `node epic-games` at the end of the `docker run` command, or if you want several `bash -c "node epic-games.js; node gog.js"`.
Data (including json files with claimed games, codes to redeem, screenshots) is stored in the Docker volume `fgc`.

<details>
  <summary>I want to run without Docker or develop locally.</summary>

1. [Install Node.js](https://nodejs.org/en/download)
2. Clone/download this repository and `cd` into it in a terminal
3. Run `npm install`
4. Run `pip install apprise` to install [apprise](https://github.com/caronc/apprise) if you want notifications

During `npm install` Playwright will download its Firefox to a cache in home ([doc](https://playwright.dev/docs/browsers#managing-browser-binaries)).
If you are missing some dependencies for the browser on your system, you can use `sudo npx playwright install firefox --with-deps`.

If you don't want to use Docker for quasi-headless mode, you could run inside a virtual machine, on a server, or you wake your PC at night to avoid being interrupted.
</details>

## Usage
All scripts start an automated Firefox instance, either with the browser GUI shown or hidden (*headless mode*). By default, you won't see any browser open on your host system.

- When running inside Docker, the browser will be shown only inside the container. You can open http://localhost:6080 to interact with the browser running inside the container via noVNC (or use other VNC clients on port 5900).
- When running the scripts outside of Docker, the browser will be hidden by default; you can use `SHOW=1 ...` to show the UI (see options below).

When running the first time, you have to login for each store you want to claim games on.
You can login indirectly via the terminal or directly in the browser. The scripts will wait until you are successfully logged in.

There will be prompts in the terminal asking you to enter email, password, and afterwards some OTP (one time password / security code) if you have 2FA/MFA (two-/multi-factor authentication) enabled. If you want to login yourself via the browser, you can press escape in the terminal to skip the prompts.

After login, the script will continue claiming the current games. If it still waits after you are already logged in, you can restart it (and open an issue). If you run the scripts regularly, you should not have to login again.

### Configuration / Options
Options are set via [environment variables](https://kinsta.com/knowledgebase/what-is-an-environment-variable/) which allow for flexible configuration.

TODO: ~~On the first run, the script will guide you through configuration and save all settings to `data/config.env`. You can edit this file directly or run `node fgc config` to run the configuration assistant again.~~

Available options/variables and their default values:

| Option        	| Default 	| Description                                                            	|
|---------------	|---------	|------------------------------------------------------------------------	|
| SHOW          	| 1       	| Show browser if 1. Default for Docker, not shown when running outside. 	|
| WIDTH         	| 1280    	| Width of the opened browser (and of screen for VNC in Docker).         	|
| HEIGHT        	| 1280    	| Height of the opened browser (and of screen for VNC in Docker).        	|
| VNC_PASSWORD  	|         	| VNC password for Docker. No password used by default!                  	|
| NOTIFY        	|         	| Notification services to use (Pushover, Slack, Telegram...), see below.	|
| NOTIFY_TITLE  	|         	| Optional title for notifications, e.g. for Pushover.                   	|
| BROWSER_DIR   	| data/browser	| Directory for browser profile, e.g. for multiple accounts.         	|
| TIMEOUT       	| 60      	| Timeout for any page action. Should be fine even on slow machines.     	|
| LOGIN_TIMEOUT 	| 180     	| Timeout for login in seconds. Will wait twice (prompt + manual login). 	|
| EMAIL         	|         	| Default email for any login.                                           	|
| PASSWORD      	|         	| Default password for any login.                                        	|
| EG_EMAIL      	|         	| Epic Games email for login. Overrides EMAIL.                           	|
| EG_PASSWORD   	|         	| Epic Games password for login. Overrides PASSWORD.                     	|
| EG_OTPKEY     	|         	| Epic Games MFA OTP key.                                                	|
| EG_PARENTALPIN 	|         	| Epic Games Parental Controls PIN.                                      	|
| PG_EMAIL      	|         	| Prime Gaming email for login. Overrides EMAIL.                         	|
| PG_PASSWORD   	|         	| Prime Gaming password for login. Overrides PASSWORD.                   	|
| PG_OTPKEY     	|         	| Prime Gaming MFA OTP key.                                              	|
| PG_REDEEM     	| 0       	| Prime Gaming: try to redeem keys on external stores ([experimental](https://github.com/vogler/free-games-claimer/issues/5)).    	|
| PG_CLAIMDLC   	| 0       	| Prime Gaming: try to claim DLCs ([experimental](https://github.com/vogler/free-games-claimer/issues/55)).    	|
| GOG_EMAIL     	|         	| GOG email for login. Overrides EMAIL.                                  	|
| GOG_PASSWORD  	|         	| GOG password for login. Overrides PASSWORD.                            	|
| GOG_NEWSLETTER	| 0       	| Do not unsubscribe from newsletter after claiming a game if 1.         	|

See `config.js` for all options.

#### How to set options
You can add options directly in the command or put them in a file to load.

##### Docker
You can pass variables using `-e VAR=VAL`, for example `docker run -e EMAIL=foo@bar.baz -e NOTIFY='tgram://...' ...` or using `--env-file fgc.env` where `fgc.env` is a file on your host system (see [docs](https://docs.docker.com/engine/reference/commandline/run/#env)). You can also `docker cp` your configuration file to `/fgc/data/config.env` in the `fgc` volume to store it with the rest of the data instead of on the host ([example](https://github.com/moby/moby/issues/25245#issuecomment-365980572)).
If you are using [docker compose](https://docs.docker.com/compose/environment-variables/) (or Portainer etc.), you can put options in the `environment:` section.

##### Without Docker
On Linux/macOS you can prefix the variables you want to set, for example `EMAIL=foo@bar.baz SHOW=1 node epic-games` will show the browser and skip asking you for your login email.
You can also put options in `data/config.env` which will be loaded by [dotenv](https://github.com/motdotla/dotenv).

### Notifications
The scripts will try to send notifications for successfully claimed games and any errors like needing to log in or encountered captchas (should not happen).

[apprise](https://github.com/caronc/apprise) is used for notifications and offers many services including Pushover, Slack, Telegram, SMS, Email, desktop and custom notifications.
You just need to set `NOTIFY` to the notification services you want to use, e.g. `NOTIFY='mailto://myemail:mypass@gmail.com' 'pbul://o.gn5kj6nfhv736I7jC3cj3QLRiyhgl98b'` - refer to their list of services and [examples](https://github.com/caronc/apprise#command-line-usage).

### Automatic login, two-factor authentication
If you set the options for email, password and OTP key, there will be no prompts and logins should happen automatically. This is optional since all stores should stay logged in since cookies are refreshed.
To get the OTP key, it is easiest to follow the store's guide for adding an authenticator app. You should also scan the shown QR code with your favorite app to have an alternative method for 2FA.

- **Epic Games**: visit [password & security](https://www.epicgames.com/account/password), enable 'third-party authenticator app', copy the 'Manual Entry Key' and use it to set `EG_OTPKEY`.
- **Prime Gaming**: visit Amazon 'Your Account › Login & security', 2-step verification › Manage › Add new app › Can't scan the barcode, copy the bold key and use it to set `PG_OTPKEY`
- **GOG**: only offers OTP via email

Beware that storing passwords and OTP keys as clear text may be a security risk. Use a unique/generated password! TODO: maybe at least offer to base64 encode for storage.

### Epic Games Store
Run `node epic-games` (locally or in Docker).

### Amazon Prime Gaming
Run `node prime-gaming` (locally or in Docker).

Claiming the Amazon Games works out-of-the-box, however, for games on external stores you need to either link your account or redeem a key.

- Stores that require account linking: Epic Games, Battle.net, Origin.
- Stores that require redeeming a key: GOG.com, Microsoft Games, Legacy Games.
  
  Keys and URLs are printed to the console, included in notifications and saved in `data/prime-gaming.json`. A screenshot of the page with the key is also saved to `data/screenshots`.
  [TODO](https://github.com/vogler/free-games-claimer/issues/5): ~~redeem keys on external stores.~~

### Run periodically
#### How often?
Epic Games usually has two free games *every week*, before Christmas every day.
Prime Gaming has new games *every month* or more often during Prime days.
GOG usually has one new game every couples of weeks.

It is save to run the scripts every day.

#### How to schedule?
The container/scripts will claim currently available games and then exit.
If you want it to run regularly, you have to schedule the runs yourself:

- Linux/macOS: `crontab -e` ([example](https://github.com/vogler/free-games-claimer/discussions/56))
- macOS: [launchd](https://stackoverflow.com/questions/132955/how-do-i-set-a-task-to-run-every-so-often)
- Windows: [task scheduler](https://active-directory-wp.com/docs/Usage/How_to_add_a_cron_job_on_Windows/Scheduled_tasks_and_cron_jobs_on_Windows/index.html), [other options](https://stackoverflow.com/questions/132971/what-is-the-windows-version-of-cron)
- any OS: use a process manager like [pm2](https://pm2.keymetrics.io/docs/usage/restart-strategies/)

TODO: ~~add some server-mode where the script just keeps running and claims games e.g. every day.~~

### Problems?

Check the open [issues](https://github.com/vogler/free-games-claimer/issues) and comment there or open a new issue.

If you're a developer, you can use `PWDEBUG=1 ...` to [inspect](https://playwright.dev/docs/inspector) which opens a debugger where you can step through the script.


## History/DevLog
<details>
  <summary>Click to expand</summary>

Tried [epicgames-freebies-claimer](https://github.com/Revadike/epicgames-freebies-claimer), but had problems since epicgames introduced hcaptcha (see [issue](https://github.com/Revadike/epicgames-freebies-claimer/issues/172)).

Played around with puppeteer before, now trying newer https://playwright.dev which is pretty similar.
Playwright Inspector and `codegen` to generate scripts are nice, but failed to generate the right code for clicking a button in an iframe.

Added [main.spec.ts](https://github.com/vogler/epicgames-claimer/commit/e5ce7916ab6329cfc7134677c4d89c2b3fa3ba97#diff-d18d03e9c407a20e05fbf03cbd6f9299857740544fb6b50d6a70b9c6fbc35831) which was the test script generated by `npx playwright codegen` with manual fix for clicking buttons in the created iframe. Can be executed by `npx playwright test`. The test runner has options `--debug` and `--timeout` and can execute typescript which is nice. However, this only worked up to the button 'I Agree', and then showed an hcaptcha.

Added [main.captcha.js](https://github.com/vogler/epicgames-claimer/commit/e5ce7916ab6329cfc7134677c4d89c2b3fa3ba97#diff-d18d03e9c407a20e05fbf03cbd6f9299857740544fb6b50d6a70b9c6fbc35831) which uses beta of `playwright-extra@next` and `@extra/recaptcha@next` (from [comment on puppeteer-extra](https://github.com/berstend/puppeteer-extra/pull/303#issuecomment-775277480)).
However, `playwright-extra` seems to be old and missing `:has-text` selector (fixed [here](https://github.com/vogler/epicgames-claimer/commit/ba97a0e840b65f4476cca18e28d8461b0c703420)) and `page.frameLocator`, so the script did not run without adjustments.
Also, solving via [2captcha](https://2captcha.com?from=13225256) is a paid service which takes time and may be unreliable.
<!-- Alternative: https://anti-captcha.com -->

Added [main.stealth.js](https://github.com/vogler/epicgames-claimer/commit/64d0ba8ce71baec3947d1b64acd567befcb39340#diff-f70d3bd29df4a343f11062a97063953173491ce30fe34f69a0fc52517adbf342) which uses the stealth plugin without `playwright-extra` wrapper but up-to-date `playwright` (from [comment](https://github.com/berstend/puppeteer-extra/issues/454#issuecomment-917437212)).
The listed evasions are enough to not show an hcaptcha. Script claimed game successfully in non-headless mode.

Removed `main.captcha.js`.
Using Playwright Test (`main.spec.ts`) instead of Library (`main.stealth.js`) has the advantage of free CLI like `--debug` and `--timeout`.
<!-- TODO: check if stealth plugin can be setup with `contextOptions` ([doc](https://playwright.dev/docs/test-configuration#more-browser-and-context-options)). -->

Button selectors should preferably use text in order to be more stable against changes in the DOM.

Renamed repository from epicgames-claimer to free-games-claimer since a script for Amazon Prime Gaming was also added. Removed all old scripts in favor of just `epic-games.js` and `prime-gaming.js`.

epic games: `headless` mode gets hcaptcha challenge. More details/references in [issue](https://github.com/vogler/free-games-claimer/issues/2).

https://github.com/vogler/free-games-claimer/pull/11 introduced a Dockerfile for running non-headless inside the container via xvfb which makes it headless for the host running the container.

v1.0 Standalone scripts node epic-games and node prime-gaming using Chromium.

Changed to Firefox for all scripts since Chromium led to captchas. Claiming then also worked in headless mode without Docker.

Added options via env vars, configurable in `data/config.env`.

Added OTP generation via otplib for automatic login, even with 2FA.

Added notifications via [apprise](https://github.com/caronc/apprise).
</details>

[![Star History Chart](https://api.star-history.com/svg?repos=vogler/free-games-claimer&type=Date)](https://star-history.com/#vogler/free-games-claimer&Date)

---

Logo with smaller aspect ratio (for Telegram bot etc.): 👾 - [emojipedia](https://emojipedia.org/alien-monster/)

![logo-fgc](https://user-images.githubusercontent.com/493741/214589922-093d6557-6393-421c-b577-da58ff3671bc.png)
