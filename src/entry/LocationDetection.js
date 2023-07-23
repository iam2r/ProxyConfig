/******************************************
 * @license
 * @name 节点地理位置查询
 * @statement 仅供学习交流|禁止用于商业用途
******************************************

******************************************/

import Env from '../common/Env';
const messages = {
	en: {
		ip: 'IP',
		asn: 'ASN',
		org: 'ASN ORG',
		isp: 'ISP',
		countryCode: 'Country',
		city: 'City',
		lon: 'Lon',
		lat: 'Lat',
		title: 'LocationDetection',
		timeout: 'Timeout',
	},
	zh: {
		ip: '远端IP地址',
		asn: '远端IP ASN',
		org: 'ASN所属机构',
		isp: '远端ISP',
		countryCode: '远端IP地区',
		city: '远端IP城市',
		lon: '远端经度',
		lat: '远端纬度',
		title: '地理位置查询',
		timeout: '查询超时',
	},
};
const $ = Env('LocationDetection', {
	i18nOptions: {
		locale: 'en',
		messages,
	},
});

function json2info(cnt) {
	cnt = JSON.parse(cnt);
	const dataKeyMapI18nKey = {
		query: 'ip',
		as: 'asn',
		org: 'org',
		isp: 'isp',
		countryCode: 'countryCode',
		city: 'city',
		lon: 'lon',
		lat: 'lat',
	};

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
    ${Object.entries(dataKeyMapI18nKey).reduce((pre, [key, i18nKey], i) => {
			const value = cnt[key];
			pre += value
				? `<b><font>${$.i18n.t(i18nKey)}</font> : </b><font>${key === 'countryCode' ? `${value} ⟦${flags.get(value)}⟧` : value}</font><br/>`
				: '';
			return pre;
		}, '')}
    
    -------------------------------
    <br/>
    <font color=#6959CD> <b>Node</b> ➟ ${$.getPolicy()} </font>
    </p>`;
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
		$.done({ title: $.i18n.t('title'), htmlMessage: data ? json2info(data) : '' });
	} catch (error) {
		$.done({
			title: $.i18n.t('title'),
			htmlMessage: `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: bold;"></br></br>🔴 ${$.i18n.t(
				'timeout'
			)}</p>`,
		});
	}
})();
