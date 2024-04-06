const path = require('node:path');
const process = require('node:process');
const fs = require('node:fs');

module.exports.options = {
	githubPath: 'jaredwray/airhorn',
	siteTitle: 'Airhorn',
	siteDescription: 'Cloud Native Notifications Library',
	siteUrl: 'https://airhorn.org',
};

module.exports.onPrepare = async config => {
	const readmePath = path.join(process.cwd(), './README.md');
	const readmeSitePath = path.join(config.sitePath, 'README.md');
	const readme = await fs.promises.readFile(readmePath, 'utf8');
	const updatedReadme = readme.replace('![Airhorn](site/logo.svg "Airhorn")\n\n---', '');
	console.log('writing updated readme to', readmeSitePath);
	await fs.promises.writeFile(readmeSitePath, updatedReadme);
};
