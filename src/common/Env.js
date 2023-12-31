/**
 *
 * @param {string} name
 * @param {{i18nOptions?:{locale:string,messages:Record<string,any}}} [opts]
 * @returns
 */
export default function Env(name, opts = {}) {
	class Http {
		constructor(env) {
			this.env = env;
		}

		send(opts, method = 'GET') {
			opts = typeof opts === 'string' ? { url: opts } : opts;
			let sender = this.get;
			if (method === 'POST') {
				sender = this.post;
			}
			return new Promise((resolve, reject) => {
				sender.call(this, opts, (err, resp, body) => {
					if (err) reject(err);
					else resolve(resp);
				});
			});
		}

		get(opts) {
			return this.send.call(this.env, opts);
		}

		post(opts) {
			return this.send.call(this.env, opts, 'POST');
		}
	}

	class I18n {
		constructor(env, i18nOptions = {}) {
			this.env = env;
			this.setLocale(i18nOptions.locale);
			this.setMessages(i18nOptions.messages);
		}
		setMessages(messages = {}) {
			this.messages = messages;
		}
		/**
		 *
		 * @param {string} locale
		 */
		setLocale(locale) {
			this.locale = locale;
		}
		/**
		 * @param {string} key
		 * @returns {string}
		 */
		t(key) {
			const message = this.messages[this.locale] || {};
			return this.env.lodash_get(message, key) || key;
		}
	}

	return new (class {
		constructor(name, opts) {
			this.name = name;
			this.http = new Http(this);
			this.i18n = new I18n(this, opts.i18nOptions);
			this.data = null;
			this.dataFile = 'box.dat';
			this.logs = [];
			this.isMute = false;
			this.isNeedRewrite = false;
			this.logSeparator = '\n';
			this.encoding = 'utf-8';
			this.startTime = new Date().getTime();
			Object.assign(this, opts);
			this.log('', `🔔${this.name}, 开始!`);
		}
		/**
		 * @returns {'Loon'|'Shadowrocket'|'Surge'|'Stash'|'Quantumult X'|'Node.js'}
		 */
		getEnv() {
			switch (true) {
				case 'undefined' !== typeof $loon:
					return 'Loon';
				case 'undefined' !== typeof $rocket:
					return 'Shadowrocket';
				case 'undefined' !== typeof $environment && $environment['surge-version']:
					return 'Surge';
				case 'undefined' !== typeof $environment && $environment['stash-version']:
					return 'Stash';
				case 'undefined' !== typeof $task:
					return 'Quantumult X';
				default:
					break;
			}
			return 'Node.js';
		}

		isNode() {
			return 'Node.js' === this.getEnv();
		}

		isQuanX() {
			return 'Quantumult X' === this.getEnv();
		}

		isSurge() {
			return 'Surge' === this.getEnv();
		}

		isLoon() {
			return 'Loon' === this.getEnv();
		}

		isShadowrocket() {
			return 'Shadowrocket' === this.getEnv();
		}

		isStash() {
			return 'Stash' === this.getEnv();
		}

		toObj(str, defaultValue = null) {
			try {
				return JSON.parse(str);
			} catch {
				return defaultValue;
			}
		}

		toStr(obj, defaultValue = null) {
			try {
				return JSON.stringify(obj);
			} catch {
				return defaultValue;
			}
		}

		getjson(key, defaultValue) {
			let json = defaultValue;
			const val = this.getdata(key);
			if (val) {
				try {
					json = JSON.parse(this.getdata(key));
				} catch {}
			}
			return json;
		}

		setjson(val, key) {
			try {
				return this.setdata(JSON.stringify(val), key);
			} catch {
				return false;
			}
		}

		getScript(url) {
			return new Promise((resolve) => {
				this.get({ url }, (err, resp, body) => resolve(body));
			});
		}

		async runScript(script, runOpts) {
			try {
				return await new Promise((resolve) => {
					let httpapi = this.getdata('@chavy_boxjs_userCfgs.httpapi');
					httpapi = httpapi ? httpapi.replace(/\n/g, '').trim() : httpapi;
					let httpapi_timeout = this.getdata('@chavy_boxjs_userCfgs.httpapi_timeout');
					httpapi_timeout = httpapi_timeout ? httpapi_timeout * 1 : 20;
					httpapi_timeout = runOpts && runOpts.timeout ? runOpts.timeout : httpapi_timeout;
					const [key_1, addr] = httpapi.split('@');
					const opts = {
						url: `http://${addr}/v1/scripting/evaluate`,
						body: {
							script_text: script,
							mock_type: 'cron',
							timeout: httpapi_timeout,
						},
						headers: { 'X-Key': key_1, Accept: '*/*' },
						timeout: httpapi_timeout,
					};
					this.post(opts, (err, resp, body) => resolve(body));
				});
			} catch (e) {
				return this.logErr(e);
			}
		}

		loaddata() {
			if (this.isNode()) {
				this.fs = this.fs ? this.fs : require('fs');
				this.path = this.path ? this.path : require('path');
				const curDirDataFilePath = this.path.resolve(this.dataFile);
				const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile);
				const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
				const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
				if (isCurDirDataFile || isRootDirDataFile) {
					const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath;
					try {
						return JSON.parse(this.fs.readFileSync(datPath));
					} catch (e) {
						return {};
					}
				} else return {};
			} else return {};
		}

		writedata() {
			if (this.isNode()) {
				this.fs = this.fs ? this.fs : require('fs');
				this.path = this.path ? this.path : require('path');
				const curDirDataFilePath = this.path.resolve(this.dataFile);
				const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile);
				const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
				const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
				const jsondata = JSON.stringify(this.data);
				if (isCurDirDataFile) {
					this.fs.writeFileSync(curDirDataFilePath, jsondata);
				} else if (isRootDirDataFile) {
					this.fs.writeFileSync(rootDirDataFilePath, jsondata);
				} else {
					this.fs.writeFileSync(curDirDataFilePath, jsondata);
				}
			}
		}

		lodash_get(source, path, defaultValue = undefined) {
			const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.');
			let result = source;
			for (const p of paths) {
				result = Object(result)[p];
				if (result === undefined) {
					return defaultValue;
				}
			}
			return result;
		}

		lodash_set(obj, path, value) {
			if (Object(obj) !== obj) return obj;
			if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
			path
				.slice(0, -1)
				.reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[
				path[path.length - 1]
			] = value;
			return obj;
		}

		getdata(key) {
			let val = this.getval(key);
			// 如果以 @
			if (/^@/.test(key)) {
				const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key);
				const objval = objkey ? this.getval(objkey) : '';
				if (objval) {
					try {
						const objedval = JSON.parse(objval);
						val = objedval ? this.lodash_get(objedval, paths, '') : val;
					} catch (e) {
						val = '';
					}
				}
			}
			return val;
		}

		setdata(val, key) {
			let issuc = false;
			if (/^@/.test(key)) {
				const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key);
				const objdat = this.getval(objkey);
				const objval = objkey ? (objdat === 'null' ? null : objdat || '{}') : '{}';
				try {
					const objedval = JSON.parse(objval);
					this.lodash_set(objedval, paths, val);
					issuc = this.setval(JSON.stringify(objedval), objkey);
				} catch (e) {
					const objedval = {};
					this.lodash_set(objedval, paths, val);
					issuc = this.setval(JSON.stringify(objedval), objkey);
				}
			} else {
				issuc = this.setval(val, key);
			}
			return issuc;
		}

		getval(key) {
			switch (this.getEnv()) {
				case 'Surge':
				case 'Loon':
				case 'Stash':
				case 'Shadowrocket':
					return $persistentStore.read(key);
				case 'Quantumult X':
					return $prefs.valueForKey(key);
				case 'Node.js':
					this.data = this.loaddata();
					return this.data[key];
				default:
					return (this.data && this.data[key]) || null;
			}
		}

		setval(val, key) {
			switch (this.getEnv()) {
				case 'Surge':
				case 'Loon':
				case 'Stash':
				case 'Shadowrocket':
					return $persistentStore.write(val, key);
				case 'Quantumult X':
					return $prefs.setValueForKey(val, key);
				case 'Node.js':
					this.data = this.loaddata();
					this.data[key] = val;
					this.writedata();
					return true;
				default:
					return (this.data && this.data[key]) || null;
			}
		}

		initGotEnv(opts) {
			this.got = this.got ? this.got : require('got');
			this.cktough = this.cktough ? this.cktough : require('tough-cookie');
			this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
			if (opts) {
				opts.headers = opts.headers ? opts.headers : {};
				if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
					opts.cookieJar = this.ckjar;
				}
			}
		}

		get(request, callback = () => {}) {
			if (request.headers) {
				delete request.headers['Content-Type'];
				delete request.headers['Content-Length'];

				// HTTP/2 全是小写
				delete request.headers['content-type'];
				delete request.headers['content-length'];
			}
			switch (this.getEnv()) {
				case 'Surge':
				case 'Loon':
				case 'Stash':
				case 'Shadowrocket':
				default:
					if (this.isSurge() && this.isNeedRewrite) {
						request.headers = request.headers || {};
						Object.assign(request.headers, { 'X-Surge-Skip-Scripting': false });
					}
					$httpClient.get(request, (err, resp, body) => {
						if (!err && resp) {
							resp.body = body;
							resp.statusCode = resp.status ? resp.status : resp.statusCode;
							resp.status = resp.statusCode;
						}
						callback(err, resp, body);
					});
					break;
				case 'Quantumult X':
					if (this.isNeedRewrite) {
						request.opts = request.opts || {};
						Object.assign(request.opts, { hints: false });
					}
					$task.fetch(request).then(
						(resp) => {
							const { statusCode: status, statusCode, headers, body, bodyBytes } = resp;
							callback(null, { status, statusCode, headers, body, bodyBytes }, body, bodyBytes);
						},
						(err) => callback((err && err.error) || 'UndefinedError')
					);
					break;
				case 'Node.js':
					let iconv = require('iconv-lite');
					this.initGotEnv(request);
					this.got(request)
						.on('redirect', (resp, nextOpts) => {
							try {
								if (resp.headers['set-cookie']) {
									const ck = resp.headers['set-cookie'].map(this.cktough.Cookie.parse).toString();
									if (ck) {
										this.ckjar.setCookieSync(ck, null);
									}
									nextOpts.cookieJar = this.ckjar;
								}
							} catch (e) {
								this.logErr(e);
							}
							// this.ckjar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
						})
						.then(
							(resp) => {
								const { statusCode: status, statusCode, headers, rawBody } = resp;
								const body = iconv.decode(rawBody, this.encoding);
								callback(null, { status, statusCode, headers, rawBody, body }, body);
							},
							(err) => {
								const { message: error, response: resp } = err;
								callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding));
							}
						);
					break;
			}
		}

		post(request, callback = () => {}) {
			const method = request.method ? request.method.toLocaleLowerCase() : 'post';

			// 如果指定了请求体, 但没指定 `Content-Type`、`content-type`, 则自动生成。
			if (request.body && request.headers && !request.headers['Content-Type'] && !request.headers['content-type']) {
				// HTTP/1、HTTP/2 都支持小写 headers
				request.headers['content-type'] = 'application/x-www-form-urlencoded';
			}
			// 为避免指定错误 `content-length` 这里删除该属性，由工具端 (HttpClient) 负责重新计算并赋值
			if (request.headers) {
				delete request.headers['Content-Length'];
				delete request.headers['content-length'];
			}
			switch (this.getEnv()) {
				case 'Surge':
				case 'Loon':
				case 'Stash':
				case 'Shadowrocket':
				default:
					if (this.isSurge() && this.isNeedRewrite) {
						request.headers = request.headers || {};
						Object.assign(request.headers, { 'X-Surge-Skip-Scripting': false });
					}
					$httpClient[method](request, (err, resp, body) => {
						if (!err && resp) {
							resp.body = body;
							resp.statusCode = resp.status ? resp.status : resp.statusCode;
							resp.status = resp.statusCode;
						}
						callback(err, resp, body);
					});
					break;
				case 'Quantumult X':
					request.method = method;
					if (this.isNeedRewrite) {
						request.opts = request.opts || {};
						Object.assign(request.opts, { hints: false });
					}
					$task.fetch(request).then(
						(resp) => {
							const { statusCode: status, statusCode, headers, body, bodyBytes } = resp;
							callback(null, { status, statusCode, headers, body, bodyBytes }, body, bodyBytes);
						},
						(err) => callback((err && err.error) || 'UndefinedError')
					);
					break;
				case 'Node.js':
					let iconv = require('iconv-lite');
					this.initGotEnv(request);
					const { url, ..._request } = request;
					this.got[method](url, _request).then(
						(resp) => {
							const { statusCode: status, statusCode, headers, rawBody } = resp;
							const body = iconv.decode(rawBody, this.encoding);
							callback(null, { status, statusCode, headers, rawBody, body }, body);
						},
						(err) => {
							const { message: error, response: resp } = err;
							callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding));
						}
					);
					break;
			}
		}
		/**
		 *
		 * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
		 *    :$.time('yyyyMMddHHmmssS')
		 *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
		 *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
		 * @param {string} fmt 格式化参数
		 * @param {number} 可选: 根据指定时间戳返回格式化日期
		 *
		 */
		time(fmt = 'yyyy-MM-dd HH:mm:ss.S', ts = null) {
			const date = ts ? new Date(ts) : new Date();
			let o = {
				'M+': date.getMonth() + 1,
				'd+': date.getDate(),
				'H+': date.getHours(),
				'm+': date.getMinutes(),
				's+': date.getSeconds(),
				'q+': Math.floor((date.getMonth() + 3) / 3),
				S: date.getMilliseconds(),
			};
			if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
			for (let k in o)
				if (new RegExp('(' + k + ')').test(fmt))
					fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
			return fmt;
		}

		/**
		 *
		 * @param {Object} options
		 * @returns {String} 将 Object 对象 转换成 queryStr: key=val&name=senku
		 */
		queryStr(options) {
			let queryString = '';

			for (const key in options) {
				let value = options[key];
				if (value != null && value !== '') {
					if (typeof value === 'object') {
						value = JSON.stringify(value);
					}
					queryString += `${key}=${value}&`;
				}
			}
			queryString = queryString.substring(0, queryString.length - 1);

			return queryString;
		}

		/**
		 * 系统通知
		 *
		 * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
		 *
		 * 示例:
		 * $.msg(title, subt, desc, 'twitter://')
		 * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
		 * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
		 *
		 * @param {string} title 标题
		 * @param {string} subt 副标题
		 * @param {string} desc 通知详情
		 * @param {string|{openUrl?:string,mediaUrl?:string,updatePasteboard?:string}} [opts] 通知参数
		 *
		 */
		msg(title = name, subt = '', desc = '', opts = {}) {
			const toEnvOpts = (rawopts) => {
				switch (typeof rawopts) {
					case undefined:
						return rawopts;
					case 'string':
						switch (this.getEnv()) {
							case 'Surge':
							case 'Stash':
							default:
								return { url: rawopts };
							case 'Loon':
							case 'Shadowrocket':
								return rawopts;
							case 'Quantumult X':
								return { 'open-url': rawopts };
							case 'Node.js':
								return {
									open: openUrl,
								};
						}
					case 'object': {
						let openUrl = rawopts.openUrl || rawopts['open-url'] || rawopts.url;
						let mediaUrl = rawopts.mediaUrl || rawopts['media-url'];
						let updatePasteboard = rawopts.updatePasteboard || rawopts['update-pasteboard'];
						switch (this.getEnv()) {
							case 'Surge':
							case 'Stash':
							case 'Shadowrocket':
							default: {
								return { url: openUrl };
							}
							case 'Loon': {
								/**
								 * ios 16.5.1 开启vpn的情况下传入mediaUrl 时 通知无法调用成功
								 */
								mediaUrl = '';
								return { openUrl, mediaUrl };
							}
							case 'Quantumult X': {
								return {
									'open-url': openUrl,
									'media-url': mediaUrl,
									'update-pasteboard': updatePasteboard,
								};
							}
							case 'Node.js':
								return {
									contentImage: mediaUrl,
									open: openUrl,
								};
						}
					}
					default:
						return undefined;
				}
			};
			if (!this.isMute) {
				switch (this.getEnv()) {
					case 'Surge':
					case 'Loon':
					case 'Stash':
					case 'Shadowrocket':
					default:
						$notification.post(title, subt, desc, toEnvOpts(opts));
						break;
					case 'Quantumult X':
						$notify(title, subt, desc, toEnvOpts(opts));
						break;
					case 'Node.js':
						const notifier = require('node-notifier');
						notifier.notify({
							title: title,
							subtitle: subt,
							message: desc,
							sound: true,
							...toEnvOpts(opts),
						});
						break;
				}
			}
			if (!this.isMuteLog) {
				let logs = ['', '==============📣系统通知📣=============='];
				logs.push(title);
				subt ? logs.push(subt) : '';
				desc ? logs.push(desc) : '';
				this.log(...logs);
			}
		}

		log(...logs) {
			if (logs.length > 0) {
				this.logs = [
					...this.logs,
					{
						time: this.time(),
						logs,
					},
				];
			}
			console.log(logs.join(this.logSeparator));
		}

		logErr(err) {
			switch (this.getEnv()) {
				case 'Surge':
				case 'Loon':
				case 'Stash':
				case 'Shadowrocket':
				case 'Quantumult X':
				default:
					this.log('', `❗️${this.name}, 错误!`, err);
					break;
				case 'Node.js':
					this.log('', `❗️${this.name}, 错误!`, err.stack);
					break;
			}
		}

		wait(time) {
			return new Promise((resolve) => setTimeout(resolve, time));
		}

		done(val = {}) {
			const endTime = new Date().getTime();
			const costTime = (endTime - this.startTime) / 1000;
			this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`);
			this.log();
			switch (this.getEnv()) {
				case 'Surge':
				case 'Loon':
				case 'Stash':
				case 'Shadowrocket':
				case 'Quantumult X':
				default:
					$done(val);
					break;
				case 'Node.js':
					console.log(val);
					process.exit(1);
					break;
			}
		}

		getPolicy() {
			switch (this.getEnv()) {
				case 'Loon':
					return $environment.params.node;
				case 'Quantumult X':
					return $environment.params;
				case 'Node.js':
					return '';
				default:
					return $environment.params;
			}
		}

		/**
		 * Construct Redirect Reqeusts
		 * @param {Object} request - Original Request Content
		 * @param {Object} proxyName - Proxies Name
		 * @return {Object} Modify Request Content with Policy
		 */
		requestWithPolicy(request = {}, proxyName = '') {
			if (proxyName) {
				if (this.isLoon()) request.node = proxyName;
				if (this.isQuanX()) {
					if (request.opts) request.opts.policy = proxyName;
					else request.opts = { policy: proxyName };
				}
				if (this.isSurge()) {
					delete request.id;
					request.headers['X-Surge-Policy'] = proxyName;
					request.policy = proxyName;
				}
				if (this.isStash()) request.headers['X-Stash-Selected-Proxy'] = encodeURI(proxyName);
				if (this.isShadowrocket()) $.logErr(`❗️${$.name}, ${Fetch.name}执行失败`, `不支持的app: Shadowrocket`, '');
			}

			return request;
		}
	})(name, opts);
}
