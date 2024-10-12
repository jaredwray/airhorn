import fs from 'fs';
import path from 'path';

export const options = {
	githubPath: 'jaredwray/airhorn',
	siteTitle: 'Airhorn',
	siteDescription: 'Cloud Native Notifications Library',
	siteUrl: 'https://airhorn.org',
};

export const onPrepare = async config => {
	const readmePath = path.join(process.cwd(), './README.md');
	const readmeSitePath = path.join(config.sitePath, 'README.md');
	const readme = await fs.promises.readFile(readmePath, 'utf8');
	const updatedReadme = readme.replace('![Airhorn](site/logo.svg "Airhorn")', '');
	console.log('Writing updated readme to', readmeSitePath);
	await fs.promises.writeFile(readmeSitePath, updatedReadme);
};
