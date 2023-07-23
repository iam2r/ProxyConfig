/******************************************
 * @license
 * @name 节点地理位置查询
 * @statement 仅供学习交流|禁止用于商业用途
******************************************

******************************************/

import Env from '../common/Env';

const $ = Env('LocationDetection');

const getRequestOpts = () => {
	switch ($.getEnv()) {
		case 'Loon':
			return {
				node: getPolicy(),
			};
		case 'Quantumult X':
			return {
				opts: {
					policy: getPolicy(),
				},
			};
		case 'Node.js':
		default:
			return {};
	}
};

function json2info(cnt) {
	cnt = JSON.parse(cnt);
	const paras = ['query', 'as', 'org', 'isp', 'countryCode', 'city', 'lon', 'lat'];
	const paran = ['IP', 'ASN', 'ASN ORG', 'ISP', 'Country', 'City', 'Lon', 'Lat'];
	const flags = new Map([
		['AC', '🇦🇨'],
		['AE', '🇦🇪'],
		['AF', '🇦🇫'],
		['AI', '🇦🇮'],
		['AL', '🇦🇱'],
		['AM', '🇦🇲'],
		['AQ', '🇦🇶'],
		['AR', '🇦🇷'],
		['AS', '🇦🇸'],
		['AT', '🇦🇹'],
		['AU', '🇦🇺'],
		['AW', '🇦🇼'],
		['AX', '🇦🇽'],
		['AZ', '🇦🇿'],
		['BA', '🇧🇦'],
		['BB', '🇧🇧'],
		['BD', '🇧🇩'],
		['BE', '🇧🇪'],
		['BF', '🇧🇫'],
		['BG', '🇧🇬'],
		['BH', '🇧🇭'],
		['BI', '🇧🇮'],
		['BJ', '🇧🇯'],
		['BM', '🇧🇲'],
		['BN', '🇧🇳'],
		['BO', '🇧🇴'],
		['BR', '🇧🇷'],
		['BS', '🇧🇸'],
		['BT', '🇧🇹'],
		['BV', '🇧🇻'],
		['BW', '🇧🇼'],
		['BY', '🇧🇾'],
		['BZ', '🇧🇿'],
		['CA', '🇨🇦'],
		['CF', '🇨🇫'],
		['CH', '🇨🇭'],
		['CK', '🇨🇰'],
		['CL', '🇨🇱'],
		['CM', '🇨🇲'],
		['CN', '🇨🇳'],
		['CO', '🇨🇴'],
		['CP', '🇨🇵'],
		['CR', '🇨🇷'],
		['CU', '🇨🇺'],
		['CV', '🇨🇻'],
		['CW', '🇨🇼'],
		['CX', '🇨🇽'],
		['CY', '🇨🇾'],
		['CZ', '🇨🇿'],
		['DE', '🇩🇪'],
		['DG', '🇩🇬'],
		['DJ', '🇩🇯'],
		['DK', '🇩🇰'],
		['DM', '🇩🇲'],
		['DO', '🇩🇴'],
		['DZ', '🇩🇿'],
		['EA', '🇪🇦'],
		['EC', '🇪🇨'],
		['EE', '🇪🇪'],
		['EG', '🇪🇬'],
		['EH', '🇪🇭'],
		['ER', '🇪🇷'],
		['ES', '🇪🇸'],
		['ET', '🇪🇹'],
		['EU', '🇪🇺'],
		['FI', '🇫🇮'],
		['FJ', '🇫🇯'],
		['FK', '🇫🇰'],
		['FM', '🇫🇲'],
		['FO', '🇫🇴'],
		['FR', '🇫🇷'],
		['GA', '🇬🇦'],
		['GB', '🇬🇧'],
		['HK', '🇭🇰'],
		['HU', '🇭🇺'],
		['ID', '🇮🇩'],
		['IE', '🇮🇪'],
		['IL', '🇮🇱'],
		['IM', '🇮🇲'],
		['IN', '🇮🇳'],
		['IS', '🇮🇸'],
		['IT', '🇮🇹'],
		['JP', '🇯🇵'],
		['KR', '🇰🇷'],
		['LU', '🇱🇺'],
		['MO', '🇲🇴'],
		['MX', '🇲🇽'],
		['MY', '🇲🇾'],
		['NL', '🇳🇱'],
		['PH', '🇵🇭'],
		['RO', '🇷🇴'],
		['RS', '🇷🇸'],
		['RU', '🇷🇺'],
		['RW', '🇷🇼'],
		['SA', '🇸🇦'],
		['SB', '🇸🇧'],
		['SC', '🇸🇨'],
		['SD', '🇸🇩'],
		['SE', '🇸🇪'],
		['SG', '🇸🇬'],
		['TH', '🇹🇭'],
		['TN', '🇹🇳'],
		['TO', '🇹🇴'],
		['TR', '🇹🇷'],
		['TV', '🇹🇻'],
		['TW', '🇨🇳'],
		['UK', '🇬🇧'],
		['UM', '🇺🇲'],
		['US', '🇺🇸'],
		['UY', '🇺🇾'],
		['UZ', '🇺🇿'],
		['VA', '🇻🇦'],
		['VE', '🇻🇪'],
		['VG', '🇻🇬'],
		['VI', '🇻🇮'],
		['VN', '🇻🇳'],
		['ZA', '🇿🇦'],
	]);

	const result = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">
    -------------------------------
    <br/>
    ${paras.reduce((pre, key, i) => {
			const value = cnt[key];
			pre += value
				? `<b><font>${paran[i]}</font> : </b><font>${key === 'countryCode' ? `${value} ⟦${flags.get(value)}⟧` : value}</font><br/>`
				: '';
			return pre;
		}, '')}
    
    -------------------------------
    <br/>
    <font color=#6959CD> <b>Node</b> ➟ ${$.getPolicy()} </font>
    </p>`;
	console.log(result);

	return result;
}

(async () => {
	try {
		const { body: data } = await $.http.get(
			$.requestWithPolicy(
				{
					url: 'http://ip-api.com/json/',
				},
				$.getPolicy()
			)
		);
		$.done({ title: 'LocationDetection', htmlMessage: data ? json2info(data) : '' });
	} catch (error) {
		$.done({
			title: 'LocationDetection',
			htmlMessage: `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: bold;"></br></br>🔴 Timeout</p>`,
		});
	}
})();
