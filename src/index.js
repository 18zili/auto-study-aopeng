require('colors');

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const findChrome = require('carlo/lib/find_chrome');

const config = require('./config');

puppeteer.use(StealthPlugin());

(async () => {
	console.log('正在查找 Chrome...'.green);
	const findChromePath = await findChrome({});
	const executablePath = findChromePath.executablePath;
	console.log('正在打开 Chrome...'.green);
	const browser = await puppeteer.launch({
		executablePath,
		headless: true
	});

	console.log('正在打开奥鹏学习平台...'.green);
	const page = await browser.newPage();
	await page.goto(config.path, {
		waitUntil: [
			'load', //等待 “load” 事件触发
			'domcontentloaded' //等待 “domcontentloaded” 事件触发
		]
	});

	console.log('正在登录...'.green);
	const usernameEl = await page.$('#username');
	await usernameEl.type(config.username, { delay: 40 });
	const passwordEl = await page.$('#pwd');
	await passwordEl.type(config.password, { delay: 40 });
    const loginBtn = await page.$('#loginbtn');
    await loginBtn.click();

    console.log('登录成功 正在跳转...'.green);
    await page.waitForNavigation();

    console.log('正在获取课程列表...'.green);
    await page.waitForSelector('#onlinework-list .show_box');
    const onlineworkNames = await page.$$eval('#onlinework-list .show_box .show_bottom_left .show_bottom_first',el => el.map(el => el.innerHTML));
    const onlineworkLinks = await page.$$eval('#onlinework-list .show_box .show_bottom_right a',el => el.map(el => el.href));
    console.log(`获取到 ${ onlineworkNames.length } 门课程.`.green);

    console.log('开始签到...'.green);
    for (let i = 0; i < onlineworkLinks.length; i++) {
        console.log(`正在签到: ${ onlineworkNames[i] }...`.green);
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
    console.log('签到完成.'.green);
})();
