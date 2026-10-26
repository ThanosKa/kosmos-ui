import { spawnSync } from "node:child_process"
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"

const root = process.cwd()
const cacheDir = join(root, "node_modules/.cache/vale")
const extractedFile = join(cacheDir, "descriptions.md")

function walk(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name)
		return entry.isDirectory() ? walk(path) : [path]
	})
}

function frontmatterDescription(path: string): string | undefined {
	const match = readFileSync(path, "utf8").match(/^---\n([\s\S]*?)\n---/)
	const line = match?.[1].match(/^description:\s*(.+)$/m)?.[1]
	return line?.trim().replace(/^(["'])([\s\S]*)\1$/, "$2")
}

// Vale reads Markdown, not JSON. Each description becomes one paragraph in a
// temporary file, and `sources[i]` names the file paragraph i came from.
function extractDescriptions(): string[] {
	const sources: string[] = []
	const paragraphs: string[] = []
	const add = (file: string, text: string | undefined) => {
		if (!text) return
		sources.push(relative(root, file))
		paragraphs.push(text)
	}

	for (const file of walk(join(root, "registry")).filter((f) => f.endsWith(".registry.json"))) {
		add(file, JSON.parse(readFileSync(file, "utf8")).description)
	}
	for (const file of walk(join(root, "content/docs")).filter((f) => f.endsWith(".mdx"))) {
		add(file, frontmatterDescription(file))
	}

	mkdirSync(cacheDir, { recursive: true })
	writeFileSync(extractedFile, paragraphs.join("\n\n") + "\n")
	return sources
}

const sources = extractDescriptions()

const targets = [
	"content/docs",
	"README.md",
	"CONTRIBUTING.md",
	"GLOSSARY.md",
	...readdirSync(join(root, "docs/adr")).map((name) => `docs/adr/${name}`),
	extractedFile,
]

const run = spawnSync(
	join(root, "node_modules/.bin/vale"),
	["--config", ".vale.ini", "--output=JSON", ...targets],
	{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
)

type Alert = { Check: string; Line: number; Span: [number, number]; Severity: string; Message: string }
let results: Record<string, Alert[]>
try {
	results = JSON.parse(run.stdout || "{}")
} catch {
	console.error(run.stdout || run.stderr)
	process.exit(2)
}

let errors = 0
let warnings = 0
for (const [file, alerts] of Object.entries(results)) {
	for (const alert of alerts) {
		const where =
			file === extractedFile
				? `${sources[(alert.Line - 1) / 2]} (description)`
				: `${file}:${alert.Line}:${alert.Span[0]}`
		if (alert.Severity === "error") errors++
		else warnings++
		console.log(`${where}  ${alert.Severity}  ${alert.Check}  ${alert.Message}`)
	}
}

console.log(`\nprose: ${errors} errors, ${warnings} warnings`)
process.exit(errors > 0 ? 1 : 0)
