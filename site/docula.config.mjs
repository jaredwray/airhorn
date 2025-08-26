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
	let newFileTextGetting = "---\n";
    newFileTextGetting += `title: 'Getting Started Guide'\n`;
    newFileTextGetting += `order: 1\n`;
    newFileTextGetting += "---\n";
    newFileTextGetting += "\n";
	updatedReadme = newFileTextGetting + updatedReadme;
	console.log('Writing updated readme to', readmeSitePath);
	await fs.promises.writeFile(readmeSitePath, updatedReadme);

	// packages/airhorn
	const packageReadmePath = path.join(process.cwd(), './packages/airhorn/README.md');
	const packageReadmeSitePath = path.join(config.sitePath, 'docs/airhorn.md');
	const packageReadme = await fs.promises.readFile(packageReadmePath, 'utf8');
	let updatedPackageReadme = packageReadme.replace('![Airhorn](https://airhorn.org/logo.svg "Airhorn")', '');
	let newFileTextAirhorn = "---\n";
    newFileTextAirhorn += `title: 'airhorn'\n`;
    newFileTextAirhorn += `order: 2\n`;
    newFileTextAirhorn += "---\n";
    newFileTextAirhorn += "\n";
	updatedPackageReadme = newFileTextAirhorn + updatedPackageReadme;
	console.log('Writing updated package readme to', packageReadmeSitePath);
	await fs.promises.writeFile(packageReadmeSitePath, updatedPackageReadme);

	// packages/aws
	await createPackageFile('aws', config);

	// packages/azure
	await createPackageFile('azure', config);

	// packages/twilio
	await createPackageFile('twilio', config);
};

async function createPackageFile(packageName, config) {
	const packageFilePath = path.join(process.cwd(), `./packages/${packageName}/README.md`);
	const packageFileSitePath = path.join(config.sitePath, `docs/${packageName}.md`);
	const packageFile = await fs.promises.readFile(packageFilePath, 'utf8');
	let updatedPackageFile = packageFile.replace('![Airhorn](https://airhorn.org/logo.svg "Airhorn")', '');
	let newFileText = "---\n";
	newFileText += `title: '@airhorn/${packageName}'\n`;
	newFileText += "---\n";
	newFileText += "\n";
	updatedPackageFile = newFileText + updatedPackageFile;
	console.log('Writing updated package file to', packageFileSitePath);
	await fs.promises.writeFile(packageFileSitePath, updatedPackageFile);
}
