import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import type { DoculaConsole, DoculaOptions } from "docula";

export const options: Partial<DoculaOptions> = {
	template: "modern",
	themeMode: "light",
	githubPath: "jaredwray/airhorn",
	siteTitle: "Airhorn",
	siteDescription: "Cloud Native Notifications Library",
	siteUrl: "https://airhorn.org",
	output: "site/dist",
	editPageUrl: "https://github.com/jaredwray/airhorn/blob/main/site/docs",
};

type WriteDocOptions = {
	source: string;
	dest: string;
	title: string;
	order?: number;
	stripImage: string;
};

async function writeDocFromReadme(opts: WriteDocOptions): Promise<void> {
	const raw = await fs.promises.readFile(opts.source, "utf8");
	const stripped = raw.replace(opts.stripImage, "");
	const orderLine = opts.order === undefined ? "" : `order: ${opts.order}\n`;
	const frontMatter = `---\ntitle: '${opts.title}'\n${orderLine}---\n\n`;
	await fs.promises.writeFile(opts.dest, frontMatter + stripped);
}

export const onPrepare = async (
	config: DoculaOptions,
	console: DoculaConsole,
): Promise<void> => {
	console.step("Generating docs from monorepo READMEs…");
	await fs.promises.mkdir(path.join(config.sitePath, "docs"), {
		recursive: true,
	});

	// Root README → Getting Started
	await writeDocFromReadme({
		source: path.join(process.cwd(), "README.md"),
		dest: path.join(config.sitePath, "docs/index.md"),
		title: "Getting Started Guide",
		order: 1,
		stripImage: '![Airhorn](site/logo.svg "Airhorn")',
	});

	// packages/airhorn → airhorn.md (order 2)
	await writeDocFromReadme({
		source: path.join(process.cwd(), "packages/airhorn/README.md"),
		dest: path.join(config.sitePath, "docs/airhorn.md"),
		title: "airhorn",
		order: 2,
		stripImage: '![Airhorn](https://airhorn.org/logo.svg "Airhorn")',
	});

	// Sub-packages
	for (const name of ["aws", "azure", "twilio"] as const) {
		await writeDocFromReadme({
			source: path.join(process.cwd(), `packages/${name}/README.md`),
			dest: path.join(config.sitePath, `docs/${name}.md`),
			title: `@airhornjs/${name}`,
			stripImage: '![Airhorn](https://airhorn.org/logo.svg "Airhorn")',
		});
	}

	console.success("Docs prepared");
};
