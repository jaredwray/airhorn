// This script does a check of each public package as a consumer gets it.
// Vitest and bundlers accept code that the Node.js loader rejects. For example,
// they give named exports from a CommonJS package, and they find packages that
// are only in devDependencies. Thus this script uses no mock and no bundler.
//
// For each public package in packages/, the script does these steps:
// 1. Pack the package with "pnpm pack". This is the tarball that npm gets.
// 2. Install the tarball in an empty project outside the repository. Link only
//    the packages in dependencies, peerDependencies, and optionalDependencies.
// 3. Make sure that each file in main, module, types, bin, and exports exists.
// 4. Make sure that each import in the published files is a declared package.
// 5. Load each entry point, and each lazy import, with plain Node.js.
// 6. Run test/consumer.ts of the package with plain Node.js. This file uses the
//    package as a consumer does. For example, it constructs the provider.
// 7. Do a type check of the entry points and of test/consumer.ts.
//
// Run "pnpm build" before you run this script.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { isBuiltin } from "node:module";
import os from "node:os";
import path from "node:path";

type Manifest = {
	name: string;
	private?: boolean;
	main?: string;
	module?: string;
	types?: string;
	bin?: string | Record<string, string>;
	exports?: unknown;
	dependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
};

type WorkspacePackage = {
	directory: string;
	manifest: Manifest;
	tarball: string;
};

const root = path.resolve(import.meta.dirname, "..");
const packagesDirectory = path.join(root, "packages");
const typescriptCompiler = path.join(root, "node_modules/typescript/bin/tsc");

const run = (command: string, parameters: string[], cwd: string): string => {
	try {
		return execFileSync(command, parameters, {
			cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
	} catch (error) {
		const { stdout, stderr } = error as { stdout?: string; stderr?: string };
		// Remove the stack lines. The first lines give the cause.
		const output = `${stdout ?? ""}${stderr ?? ""}`
			.split("\n")
			.filter((line) => !/^\s+at /.test(line))
			.join("\n")
			.trim();
		throw new Error(output || String(error));
	}
};

const readManifest = (directory: string): Manifest =>
	JSON.parse(fs.readFileSync(path.join(directory, "package.json"), "utf8"));

const declaredPackages = (manifest: Manifest): string[] =>
	Object.keys({
		...manifest.dependencies,
		...manifest.peerDependencies,
		...manifest.optionalDependencies,
	});

// Get the file paths from an "exports" value. Ignore the patterns that have "*".
const exportTargets = (value: unknown): string[] => {
	if (typeof value === "string") {
		return value.includes("*") ? [] : [value];
	}

	if (value && typeof value === "object") {
		return Object.values(value).flatMap(exportTargets);
	}

	return [];
};

// Get the specifiers that a consumer can import. Ignore the patterns and the
// entries that are not code.
const entryPoints = (manifest: Manifest): string[] => {
	const { name, exports } = manifest;
	if (!exports || typeof exports !== "object" || Array.isArray(exports)) {
		return [name];
	}

	const subpaths = Object.keys(exports).filter((key) => key.startsWith("."));
	if (subpaths.length === 0) {
		return [name];
	}

	return subpaths
		.filter((key) => !key.includes("*") && !key.endsWith(".json"))
		.map((key) => path.posix.join(name, key));
};

const packageNameOf = (specifier: string): string =>
	specifier
		.split("/")
		.slice(0, specifier.startsWith("@") ? 2 : 1)
		.join("/");

const listFiles = (directory: string): string[] =>
	fs
		.readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter(
			(entry) =>
				entry.isFile() &&
				!path
					.relative(directory, entry.parentPath)
					.split(path.sep)
					.includes("node_modules"),
		)
		.map((entry) => path.join(entry.parentPath, entry.name));

// Find the import specifiers in a JavaScript file or a declaration file.
// "lazy" specifiers are those that Node.js does not load with the module.
const findSpecifiers = (
	file: string,
): { all: Set<string>; lazy: Set<string> } => {
	const code = fs
		.readFileSync(file, "utf8")
		.replaceAll(/\/\*[\s\S]*?\*\//g, "")
		.replaceAll(/^\s*\/\/.*$/gm, "");
	const all = new Set<string>();
	const lazy = new Set<string>();
	const staticPattern =
		/(?:^|[\s;}])(?:import|export)\s*(?:[\w${}*,\s]+?\s*from\s*)?["']([^"'\n]+)["']/g;
	const lazyPattern = /\b(?:import|require)\s*\(\s*["'`]([^"'`\n]+)["'`]\s*\)/g;

	for (const match of code.matchAll(staticPattern)) {
		all.add(match[1]);
	}

	for (const match of code.matchAll(lazyPattern)) {
		all.add(match[1]);
		lazy.add(match[1]);
	}

	return { all, lazy };
};

// Install a packed workspace package into a directory. Link its declared
// packages into its own node_modules directory.
const install = (
	target: WorkspacePackage,
	destination: string,
	workspace: Map<string, WorkspacePackage>,
): void => {
	fs.mkdirSync(destination, { recursive: true });
	run(
		"tar",
		["-xzf", target.tarball, "-C", destination, "--strip-components=1"],
		root,
	);

	for (const name of declaredPackages(target.manifest)) {
		const link = path.join(destination, "node_modules", name);
		const workspacePackage = workspace.get(name);
		if (workspacePackage) {
			install(workspacePackage, link, workspace);
			continue;
		}

		const installed = path.join(target.directory, "node_modules", name);
		if (!fs.existsSync(installed)) {
			if (name in (target.manifest.optionalDependencies ?? {})) {
				continue;
			}

			throw new Error(
				`${name} is not installed for ${target.manifest.name}. Run "pnpm install".`,
			);
		}

		fs.mkdirSync(path.dirname(link), { recursive: true });
		fs.symlinkSync(fs.realpathSync(installed), link, "junction");
	}
};

const checkPackage = (
	target: WorkspacePackage,
	project: string,
	workspace: Map<string, WorkspacePackage>,
): string[] => {
	const problems: string[] = [];
	const packageDirectory = path.join(
		project,
		"node_modules",
		target.manifest.name,
	);
	fs.writeFileSync(
		path.join(project, "package.json"),
		JSON.stringify({ name: "consumer", private: true, type: "module" }),
	);
	install(target, packageDirectory, workspace);

	// Use the manifest from the tarball. "pnpm pack" changes some of its fields.
	const manifest = readManifest(packageDirectory);

	// Step 3: the files that package.json refers to.
	const bin = typeof manifest.bin === "string" ? [manifest.bin] : manifest.bin;
	const targets = [
		manifest.main,
		manifest.module,
		manifest.types,
		...Object.values(bin ?? {}),
		...exportTargets(manifest.exports),
	].filter((file) => file !== undefined);
	for (const file of new Set(targets)) {
		if (!fs.existsSync(path.join(packageDirectory, file))) {
			problems.push(`package.json refers to ${file}, which is not published.`);
		}
	}

	if (targets.length === 0) {
		problems.push("package.json has no main field and no exports field.");
	}

	for (const range of Object.values(manifest.dependencies ?? {})) {
		if (/^(?:workspace|link|file|catalog):/.test(range)) {
			problems.push(`A consumer cannot install the dependency "${range}".`);
		}
	}

	// Step 4: the imports in the published files.
	const declared = new Set([manifest.name, ...declaredPackages(manifest)]);
	const lazySpecifiers = new Set<string>();
	for (const file of listFiles(packageDirectory)) {
		const isDeclaration = /\.d\.[cm]?ts$/.test(file);
		if (!isDeclaration && !/\.[cm]?js$/.test(file)) {
			continue;
		}

		const { all, lazy } = findSpecifiers(file);
		for (const specifier of all) {
			if (/^[./#]/.test(specifier) || isBuiltin(specifier)) {
				continue;
			}

			if (!declared.has(packageNameOf(specifier))) {
				problems.push(
					`${path.relative(packageDirectory, file)} imports "${specifier}", which is not in dependencies or peerDependencies.`,
				);
			} else if (!isDeclaration && lazy.has(specifier)) {
				lazySpecifiers.add(specifier);
			}
		}
	}

	// Step 5 and step 6: load the entry points with plain Node.js. Then use the
	// package as a consumer does. One Node.js process does the two steps.
	const entries = entryPoints(manifest);
	const consumerFile = path.join(target.directory, "test", "consumer.ts");
	const files = ["index.ts"];
	if (fs.existsSync(consumerFile)) {
		files.push("consumer.ts");
		fs.copyFileSync(consumerFile, path.join(project, "consumer.ts"));
	} else {
		problems.push(
			"test/consumer.ts is missing. Add this file, and use the package in it as a consumer does.",
		);
	}

	const lines = entries.map(
		(entry) =>
			`if (Object.keys(await import("${entry}")).length === 0) throw new Error("${entry} has no exports.");`,
	);
	if (files.includes("consumer.ts")) {
		lines.push('await import("./consumer.ts");');
	}

	fs.writeFileSync(path.join(project, "load.mjs"), lines.join("\n"));
	try {
		run(process.execPath, ["load.mjs"], project);
	} catch (error) {
		problems.push(`Node.js cannot use the package:\n${String(error)}`);
	}

	// Load the lazy imports from a file in the package, because the package
	// resolves them.
	if (lazySpecifiers.size > 0) {
		const loader = path.join(packageDirectory, "consumer-check-lazy.mjs");
		fs.writeFileSync(
			loader,
			[...lazySpecifiers]
				.map((specifier) => `await import("${specifier}");`)
				.join("\n"),
		);
		try {
			run(process.execPath, [loader], project);
		} catch (error) {
			problems.push(`Node.js cannot load a lazy import:\n${String(error)}`);
		}
	}

	// Step 7: do a type check of the entry points and of test/consumer.ts.
	const source = entries
		.map((entry, index) => `export * as entry${index} from "${entry}";`)
		.join("\n");
	fs.writeFileSync(path.join(project, "index.ts"), `${source}\n`);
	fs.writeFileSync(
		path.join(project, "tsconfig.json"),
		JSON.stringify({
			compilerOptions: {
				module: "nodenext",
				strict: true,
				noEmit: true,
				skipLibCheck: true,
				types: [],
			},
			files,
		}),
	);
	try {
		run(process.execPath, [typescriptCompiler, "--project", project], project);
	} catch (error) {
		problems.push(`The type check of the package failed:\n${String(error)}`);
	}

	return problems;
};

const temporaryDirectory = fs.mkdtempSync(
	path.join(fs.realpathSync(os.tmpdir()), "airhorn-consumer-"),
);
let failed = false;

try {
	// Node.js looks for packages in each parent directory. A project in the
	// repository can thus load packages that a consumer does not have.
	if (!path.relative(root, temporaryDirectory).startsWith("..")) {
		throw new Error(
			"The temporary directory is in the repository. Set TMPDIR to a different directory.",
		);
	}

	const workspace = new Map<string, WorkspacePackage>();
	const tarballDirectory = path.join(temporaryDirectory, "tarballs");
	for (const entry of fs.readdirSync(packagesDirectory).sort()) {
		const directory = path.join(packagesDirectory, entry);
		if (!fs.existsSync(path.join(directory, "package.json"))) {
			continue;
		}

		const manifest = readManifest(directory);
		if (manifest.private) {
			continue;
		}

		const packed = JSON.parse(
			run(
				"pnpm",
				["pack", "--json", "--pack-destination", tarballDirectory],
				directory,
			),
		);
		workspace.set(manifest.name, {
			directory,
			manifest,
			tarball: packed.filename,
		});
	}

	if (workspace.size === 0) {
		throw new Error("The script found no public package in packages/.");
	}

	let index = 0;
	for (const target of workspace.values()) {
		const project = path.join(temporaryDirectory, `consumer-${index++}`);
		fs.mkdirSync(project);
		const problems = checkPackage(target, project, workspace);
		if (problems.length === 0) {
			console.log(`ok   ${target.manifest.name}`);
			continue;
		}

		failed = true;
		console.error(`FAIL ${target.manifest.name}`);
		for (const problem of problems) {
			console.error(`  - ${problem.replaceAll("\n", "\n    ")}`);
		}
	}
} catch (error) {
	failed = true;
	console.error(String(error));
} finally {
	fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

if (failed) {
	console.error(
		'The consumer check failed. If dist/ is missing or old, run "pnpm build".',
	);
	process.exitCode = 1;
}
