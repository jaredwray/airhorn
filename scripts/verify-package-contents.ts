import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packages = [
	{ archive: "airhorn.tgz", directory: "airhorn", name: "airhorn" },
	{ archive: "aws.tgz", directory: "aws", name: "@airhornjs/aws" },
	{ archive: "azure.tgz", directory: "azure", name: "@airhornjs/azure" },
	{ archive: "pingram.tgz", directory: "pingram", name: "@airhornjs/pingram" },
	{ archive: "twilio.tgz", directory: "twilio", name: "@airhornjs/twilio" },
];
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryVersion = JSON.parse(
	readFileSync(join(repositoryRoot, "package.json"), "utf8"),
).version;
const requestedOutputDirectory = process.argv[2];
const temporaryOutput = requestedOutputDirectory === undefined;
const outputDirectory = temporaryOutput
	? mkdtempSync(join(tmpdir(), "airhorn-packages-"))
	: resolve(requestedOutputDirectory);

if (!temporaryOutput) {
	if (existsSync(outputDirectory) && readdirSync(outputDirectory).length > 0) {
		throw new Error(
			`Package output directory is not empty: ${outputDirectory}`,
		);
	}
	mkdirSync(outputDirectory, { recursive: true });
}

const verifyTarball = (tarballPath: string, expectedName: string) => {
	const entries = execFileSync("tar", ["-tzf", tarballPath], {
		encoding: "utf8",
	})
		.split("\n")
		.map((entry) => entry.replace(/\/$/, ""))
		.filter(Boolean);

	const unexpectedEntries = entries.filter(
		(entry) =>
			entry !== "package" &&
			entry !== "package/package.json" &&
			entry !== "package/README.md" &&
			entry !== "package/LICENSE" &&
			entry !== "package/dist" &&
			!entry.startsWith("package/dist/"),
	);

	if (unexpectedEntries.length > 0) {
		throw new Error(
			`Unexpected files in ${tarballPath}:\n${unexpectedEntries.join("\n")}`,
		);
	}

	for (const requiredEntry of [
		"package/package.json",
		"package/README.md",
		"package/LICENSE",
		"package/dist/index.js",
		"package/dist/index.d.ts",
	]) {
		if (!entries.includes(requiredEntry)) {
			throw new Error(`Missing ${requiredEntry} from ${tarballPath}`);
		}
	}

	if (!entries.some((entry) => entry.startsWith("package/dist/"))) {
		throw new Error(`Missing built output from ${tarballPath}`);
	}

	const packedManifestText = execFileSync(
		"tar",
		["-xOzf", tarballPath, "package/package.json"],
		{ encoding: "utf8" },
	);
	const packedManifest = JSON.parse(packedManifestText);
	if (packedManifest.name !== expectedName) {
		throw new Error(
			`Expected ${expectedName} in ${tarballPath}; found ${packedManifest.name}`,
		);
	}
	if (packedManifest.version !== repositoryVersion) {
		throw new Error(
			`Expected version ${repositoryVersion} in ${tarballPath}; found ${packedManifest.version}`,
		);
	}
	if (packedManifestText.includes("workspace:")) {
		throw new Error(`Unresolved workspace dependency in ${tarballPath}`);
	}
};

try {
	const packedTarballs: string[] = [];

	for (const packageDefinition of packages) {
		const tarballPath = join(outputDirectory, packageDefinition.archive);
		execFileSync(
			"pnpm",
			[
				"--dir",
				join(repositoryRoot, "packages", packageDefinition.directory),
				"pack",
				"--out",
				tarballPath,
			],
			{ cwd: repositoryRoot, stdio: "inherit" },
		);
		verifyTarball(tarballPath, packageDefinition.name);
		packedTarballs.push(packageDefinition.archive);
	}

	const checksums = packedTarballs
		.sort()
		.map((fileName) => {
			const digest = createHash("sha256")
				.update(readFileSync(join(outputDirectory, fileName)))
				.digest("hex");
			return `${digest}  ${fileName}`;
		})
		.join("\n");
	writeFileSync(join(outputDirectory, "SHA256SUMS"), `${checksums}\n`);

	console.log(
		`Verified ${packedTarballs.length} package tarballs in ${outputDirectory}`,
	);
} finally {
	if (temporaryOutput) {
		rmSync(outputDirectory, { force: true, recursive: true });
	}
}
