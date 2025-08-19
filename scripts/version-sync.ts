import fs from 'node:fs';
import path from 'node:path';

// mono repo
const rootVersionFile = path.join(path.dirname(import.meta.url), '../', 'package.json');
const packagesDir = path.join('packages');

async function bumpVersionInFile(filePath, newVersion) {
	console.log(`Bumping version in ${filePath} to ${newVersion}`);
	const resolvedPath = path.resolve(filePath);
	const packageFile = JSON.parse(await fs.promises.readFile(resolvedPath, 'utf-8'));
	packageFile.version = newVersion;
	const content = JSON.stringify(packageFile, null, 2);
	await fs.promises.writeFile(resolvedPath, content);
}

async function bumpVersionInPackages(newVersion) {
	const packages = await fs.promises.readdir(packagesDir, { withFileTypes: true });
	for (const dirent of packages) {
		if (dirent.isDirectory()) {
			const dirPath = path.join(packagesDir, dirent.name);
			const packageJsonPath = path.join(dirPath, 'package.json');
			if (fs.existsSync(packageJsonPath)) {
				await bumpVersionInFile(packageJsonPath, newVersion);
			}
		}
	}
}

// get version from root package.json
async function getRootVersion() {
	const packageFile = await import(rootVersionFile);
	return packageFile.version;
}

// run the version bump

const newVersion = await getRootVersion();
if (!newVersion) {
	console.error('No version found in root package.json');
	process.exit(1);
} else {
	console.log(`Bumping version to ${newVersion} in all packages...`);
	await bumpVersionInPackages(newVersion);
}
