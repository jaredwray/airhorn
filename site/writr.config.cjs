const path = require('node:path');
const process = require('node:process');
const fs = require('fs-extra');

module.exports.options = {
	githubPath: 'jaredwray/airhorn',
	siteTitle: 'Airhorn',
	siteDescription: 'Cloud Native Notifications Library',
	siteUrl: 'https://airhorn.org',
};

module.exports.onPrepare = async config => {
	const readmePath = path.join(process.cwd(), './README.md');
	const readmeSitePath = path.join(config.sitePath, 'README.md');
	const readme = await fs.readFile(readmePath, 'utf8');
	const updatedReadme = readme.replace('![Airhorn](site/logo.svg "Airhorn")\n\n---', '');
	console.log('writing updated readme to', readmeSitePath);
	await fs.writeFile(readmeSitePath, updatedReadme);
};
