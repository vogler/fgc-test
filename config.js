import * as dotenv from 'dotenv';
import { dataDir } from './util.js';

dotenv.config({ path: 'data/config.env' }); // loads env vars from file - will not set vars that are already set, i.e., can overwrite values from file by prefixing, e.g., VAR=VAL node ...

// Options - also see table in README.md
export const cfg = {
  debug: process.env.PWDEBUG == '1', // runs non-headless and opens https://playwright.dev/docs/inspector
  record: process.env.RECORD == '1', // `recordHar` (network) + `recordVideo`
  dryrun: process.env.DRYRUN == '1', // don't claim anything
  show: process.env.SHOW == '1', // run non-headless
  get headless() { return !this.debug && !this.show },
  width: Number(process.env.WIDTH) || 1280, // width of the opened browser
  height: Number(process.env.HEIGHT) || 1280, // height of the opened browser
  timeout: (Number(process.env.TIMEOUT) || 60) * 1000, // default timeout for playwright is 30s
  login_timeout: (Number(process.env.LOGIN_TIMEOUT) || 180) * 1000, // higher timeout for login, will wait twice: prompt + wait for manual login
  novnc_port: process.env.NOVNC_PORT, // running in docker if set
  notify: process.env.NOTIFY, // apprise notification services
  notify_title: process.env.NOTIFY_TITLE, // apprise notification title
  get dir() { // avoids ReferenceError: Cannot access 'dataDir' before initialization
    return {
      browser: process.env.BROWSER_DIR || dataDir('browser'), // for multiple accounts or testing
      screenshots: process.env.SCREENSHOTS_DIR || dataDir('screenshots'), // if not wanted: /dev/null
    }
  },
  // auth epic-games
  eg_email: process.env.EG_EMAIL || process.env.EMAIL,
  eg_password: process.env.EG_PASSWORD || process.env.PASSWORD,
  eg_otpkey: process.env.EG_OTPKEY,
  eg_parentalpin: process.env.EG_PARENTALPIN,
  // auth prime-gaming
  pg_email: process.env.PG_EMAIL || process.env.EMAIL,
  pg_password: process.env.PG_PASSWORD || process.env.PASSWORD,
  pg_otpkey: process.env.PG_OTPKEY,
  // auth gog
  gog_email: process.env.GOG_EMAIL || process.env.EMAIL,
  gog_password: process.env.GOG_PASSWORD || process.env.PASSWORD,
  gog_newsletter: process.env.GOG_NEWSLETTER == '1', // do not unsubscribe from newsletter after claiming a game
  // OTP only via GOG_EMAIL, can't add app...

  // experimmental - likely to change
  pg_redeem: process.env.PG_REDEEM == '1', // prime-gaming: redeem keys on external stores
  pg_claimdlc: process.env.PG_CLAIMDLC == '1', // prime-gaming: claim in-game content
};
