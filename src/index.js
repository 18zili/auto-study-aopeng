require('colors');

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const config = require('./config');
const message = require('./message');

puppeteer.use(StealthPlugin());

try {
    (async () => {
        message('正在打开 Chrome...');
        let browser = await require('puppeteer').launch({
            headless: true
        });
        message('正在打开奥鹏学习平台...');
        const page = await browser.newPage();
        await page.goto(config.PATH, {
            waitUntil: [
                'load', //等待 “load” 事件触发
                'domcontentloaded' //等待 “domcontentloaded” 事件触发
            ]
        });
    
        message('正在登录...');
        const usernameEl = await page.$('#username');
        await usernameEl.type(config.USERNAME, { delay: 40 });
        const passwordEl = await page.$('#pwd');
        await passwordEl.type(config.PASSWORD, { delay: 40 });
        const loginBtn = await page.$('#loginbtn');
        await loginBtn.click();
    
        message('登录成功 正在跳转...');
        await page.waitForNavigation();
    
        message('正在获取课程列表...');
        await page.waitForSelector('#onlinework-list .show_box');
        const onlineworkNames = await page.$$eval('#onlinework-list .show_box .show_bottom_left .show_bottom_first',el => el.map(el => el.innerHTML));
        const onlineworkLinks = await page.$$eval('#onlinework-list .show_box .show_bottom_right a',el => el.map(el => el.href));
        message(`获取到 ${ onlineworkNames.length } 门课程.`);
    
        message('开始签到...');
        for (let i = 0; i < onlineworkLinks.length; i++) {
            message(`正在签到: ${ onlineworkNames[i] }...`);
            const link = onlineworkLinks[i];
            const workPage = await browser.newPage();
            await workPage.goto(link, {
                waitUntil: [
                    'load',
                    'domcontentloaded',
                    'networkidle0',
                    'networkidle2'
                ]
            });
            await workPage.close();
        }
        message('签到完成.');
    })();
} catch (error) {
    message(error)
}