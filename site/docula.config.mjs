import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export const options = {
	githubPath: 'jaredwray/airhorn',
	siteTitle: 'Airhorn',
	siteDescription: 'Cloud Native Notifications Library',
	siteUrl: 'https://airhorn.org',
};

export const onPrepare = async config => {
	// mono
	await fs.promises.mkdir(config.sitePath + '/docs', { recursive: true });
	const readmePath = path.join(process.cwd(), './README.md');
	const readmeSitePath = path.join(config.sitePath, 'docs/index.md');
	const readme = await fs.promises.readFile(readmePath, 'utf8');
	let updatedReadme = readme.replace('![Airhorn](site/logo.svg "Airhorn")', '');
	updatedReadme = `---
title: 'Getting Started Guide'
order: 1
---` + updatedReadme;
	console.log('Writing updated readme to', readmeSitePath);
	await fs.promises.writeFile(readmeSitePath, updatedReadme);

	// packages/airhorn
	const packageReadmePath = path.join(process.cwd(), './packages/airhorn/README.md');
	const packageReadmeSitePath = path.join(config.sitePath, 'docs/airhorn.md');
	const packageReadme = await fs.promises.readFile(packageReadmePath, 'utf8');
	const updatedPackageReadme = `---
title: 'Airhorn'
sidebarTitle: 'Airhorn'
order: 2
---` + packageReadme;
	console.log('Writing updated package readme to', packageReadmeSitePath);
	await fs.promises.writeFile(packageReadmeSitePath, updatedPackageReadme);
};
