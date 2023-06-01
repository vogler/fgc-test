// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-js-when-using-es6-modules
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// not the same since these will give the absolute paths for this file instead of for the file using them
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// explicit object instead of Object.fromEntries since the built-in type would loose the keys, better type: https://dev.to/svehla/typescript-object-fromentries-389c
export const dataDir = s => path.resolve(__dirname, 'data', s);

// json database
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
export const jsonDb = async file => {
  const db = new Low(new JSONFile(dataDir(file)));
  await db.read();
  return db;
};


export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
// date and time as UTC (no timezone offset) in nicely readable and sortable format, e.g., 2022-10-06 12:05:27.313
export const datetimeUTC = (d = new Date()) => d.toISOString().replace('T', ' ').replace('Z', '');
// same as datetimeUTC() but for local timezone, e.g., UTC + 2h for the above in DE
export const datetime = (d = new Date()) => datetimeUTC(new Date(d.getTime() - d.getTimezoneOffset() * 60000));
export const filenamify = s => s.replaceAll(':', '.').replace(/[^a-z0-9 _\-.]/gi, '_'); // alternative: https://www.npmjs.com/package/filenamify - On Unix-like systems, / is reserved. On Windows, <>:"/\|?* along with trailing periods are reserved.

export const handleSIGINT = () => process.on('SIGINT', () => { // e.g. when killed by Ctrl-C
  console.error('\nInterrupted by SIGINT. Exit!'); // Exception shows where the script was:\n'); // killed before catch in docker...
  process.exitCode = 130; // 128+SIGINT to indicate to parent that process was killed
});

// stealth with playwright: https://github.com/berstend/puppeteer-extra/issues/454#issuecomment-917437212
// gets userAgent and then removes "Headless" from it
const newStealthContext = async (browser, contextOptions = {}, debug = false) => {
  if (!debug) { // only need to fix userAgent in headless mode
    const dummyContext = await browser.newContext();
    const originalUserAgent = await (await dummyContext.newPage()).evaluate(() => navigator.userAgent);
    await dummyContext.close();
    // console.log('originalUserAgent:', originalUserAgent); // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/96.0.4664.110 Safari/537.36
    contextOptions = {
      ...contextOptions,
      userAgent: originalUserAgent.replace("Headless", ""), // HeadlessChrome -> Chrome, TODO needed?
    };
  }
};

export const stealth = async (context) => {
  // stealth with playwright: https://github.com/berstend/puppeteer-extra/issues/454#issuecomment-917437212
  // https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth/evasions
  const enabledEvasions = [
    'chrome.app',
    'chrome.csi',
    'chrome.loadTimes',
    'chrome.runtime',
    // 'defaultArgs',
    'iframe.contentWindow',
    'media.codecs',
    'navigator.hardwareConcurrency',
    'navigator.languages',
    'navigator.permissions',
    'navigator.plugins',
    // 'navigator.vendor',
    'navigator.webdriver',
    'sourceurl',
    // 'user-agent-override', // doesn't work since playwright has no page.browser()
    'webgl.vendor',
    'window.outerdimensions'
  ];
  const stealth = {
    callbacks: [],
    async evaluateOnNewDocument(...args) {
      this.callbacks.push({ cb: args[0], a: args[1] });
    }
  };
  for (const e of enabledEvasions) {
    const evasion = await import(`puppeteer-extra-plugin-stealth/evasions/${e}/index.js`);
    evasion.default().onPageCreated(stealth);
  }
  for (let evasion of stealth.callbacks) {
    await context.addInitScript(evasion.cb, evasion.a);
  }
};

// used prompts before, but couldn't cancel prompt
// alternative inquirer is big (node_modules 29MB, enquirer 9.7MB, prompts 9.8MB, none 9.4MB) and slower
// open issue: prevents handleSIGINT() to work if prompt is cancelled with Ctrl-C instead of Escape: https://github.com/enquirer/enquirer/issues/372
import Enquirer from 'enquirer'; const enquirer = new Enquirer();
const timeoutPlugin = timeout => enquirer => { // cancel prompt after timeout ms
  enquirer.on('prompt', prompt => {
    const t = setTimeout(() => { prompt.hint = () => 'timeout'; prompt.cancel(); }, timeout);
    prompt.on('submit', _ => clearTimeout(t));
    prompt.on('cancel', _ => clearTimeout(t));
  });
}
enquirer.use(timeoutPlugin(cfg.login_timeout)); // TODO may not want to have this timeout for all prompts; better extend Prompt and add a timeout prompt option
// single prompt that just returns the non-empty value instead of an object
export const prompt = o => enquirer.prompt({name: 'name', type: 'input', message: 'Enter value', ...o}).then(r => r.name).catch(_ => {});

// notifications via apprise CLI
import { exec } from 'child_process';
import { cfg } from './config.js';

export const notify = (html) => new Promise((resolve, reject) => {
  if (!cfg.notify) return resolve();
  const title = cfg.notify_title ? `-t ${cfg.notify_title}` : '';
  exec(`apprise ${cfg.notify} -i html '${title}' -b '${html}'`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        if (error.message.includes('command not found')) {
          console.info('Run `pip install apprise`. See https://github.com/vogler/free-games-claimer#notifications');
        }
        return resolve();
    }
    if (stderr) console.error(`stderr: ${stderr}`);
    if (stdout) console.log(`stdout: ${stdout}`);
    resolve();
  });
});

export const escapeHtml = (unsafe) => unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

export const html_game_list = games => games.map(g => `- <a href="${g.url}">${escapeHtml(g.title)}</a> (${g.status})`).join('<br>');
