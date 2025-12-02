module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/better-sqlite3 [external] (better-sqlite3, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("better-sqlite3", () => require("better-sqlite3"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/better-sqlite3 [external] (better-sqlite3, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
;
;
;
const dataDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "data");
if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(dataDir)) {
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(dataDir, {
        recursive: true
    });
}
const dbPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dataDir, "database.db");
const db = new __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$29$__["default"](dbPath);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS note_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(note_id, tag_id)
);

CREATE TABLE IF NOT EXISTS command_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  command_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(command_id, tag_id)
);

CREATE TABLE IF NOT EXISTS commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  command TEXT NOT NULL,
  description TEXT NOT NULL,
  is_multi_step INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS placeholders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS placeholder_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS placeholder_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  set_id INTEGER NOT NULL,
  placeholder_name TEXT NOT NULL,
  default_value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (set_id) REFERENCES placeholder_sets(id) ON DELETE CASCADE,
  UNIQUE(set_id, placeholder_name)
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS command_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  command_id INTEGER NOT NULL,
  step_number INTEGER NOT NULL,
  command TEXT NOT NULL,
  comment TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE
);
`);
// Skip seeding during Next.js build to prevent SQLite locking
const isBuilding = process.env.NEXT_PHASE === "phase-production-build" || ("TURBOPACK compile-time value", "development") === "production" && ("TURBOPACK compile-time value", "nodejs") === "edge";
if (!isBuilding) {
    // Seed default data if empty
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
    if (userCount === 0) {
        const hashedAdminPassword = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hashSync("admin", 10);
        db.prepare("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)").run("admin", hashedAdminPassword);
    }
    const tagCount = db.prepare("SELECT COUNT(*) as count FROM tags").get().count;
    if (tagCount === 0) {
        const now = new Date().toISOString();
        const insertTag = db.prepare("INSERT INTO tags (name, created_at) VALUES (?, ?)");
        const reconTag = insertTag.run("Reconnaissance", now).lastInsertRowid;
        const enumTag = insertTag.run("Enumeration", now).lastInsertRowid;
        const exploitTag = insertTag.run("Exploitation", now).lastInsertRowid;
        const insertCmd = db.prepare("INSERT INTO commands (name, command, description, is_multi_step, created_at) VALUES (?, ?, ?, ?, ?)");
        const insertCmdTag = db.prepare("INSERT INTO command_tags (command_id, tag_id, created_at) VALUES (?, ?, ?)");
        const cmd1 = insertCmd.run("Nmap Port Scan", "nmap -sS -p- {{target}}", "Perform a full TCP port scan using Nmap", 0, now).lastInsertRowid;
        const cmd2 = insertCmd.run("Subdomain Enumeration", "subfinder -d {{target}}", "Find subdomains using Subfinder", 0, now).lastInsertRowid;
        const cmd3 = insertCmd.run("Service Version Detection", "nmap -sV -p {{port}} {{target}}", "Detect service versions on open ports", 0, now).lastInsertRowid;
        const cmd4 = insertCmd.run("SSH Brute Force", "hydra -l admin -P /path/to/wordlist.txt ssh://{{target}} -p {{port}}", "Brute force SSH using Hydra", 0, now).lastInsertRowid;
        const cmd5 = insertCmd.run("SQL Injection Test", "sqlmap -u \"{{url}}\" --batch --dbs", "Run SQLMap against a URL", 0, now).lastInsertRowid;
        // Assign tags to commands
        insertCmdTag.run(cmd1, reconTag, now);
        insertCmdTag.run(cmd2, reconTag, now);
        insertCmdTag.run(cmd3, enumTag, now);
        insertCmdTag.run(cmd4, enumTag, now);
        insertCmdTag.run(cmd5, exploitTag, now);
    }
    const placeholderCount = db.prepare("SELECT COUNT(*) as count FROM placeholders").get().count;
    if (placeholderCount === 0) {
        const now = new Date().toISOString();
        db.prepare("INSERT OR IGNORE INTO placeholders (name, created_at) VALUES (?, ?)").run("target", now);
        db.prepare("INSERT OR IGNORE INTO placeholders (name, created_at) VALUES (?, ?)").run("ip", now);
        db.prepare("INSERT OR IGNORE INTO placeholders (name, created_at) VALUES (?, ?)").run("port", now);
        db.prepare("INSERT OR IGNORE INTO placeholders (name, created_at) VALUES (?, ?)").run("url", now);
        db.prepare("INSERT OR IGNORE INTO placeholders (name, created_at) VALUES (?, ?)").run("wordlist", now);
    }
}
const __TURBOPACK__default__export__ = db;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/commands/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
const runtime = "nodejs";
async function GET() {
    const rows = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare(`
    SELECT c.*, 
           GROUP_CONCAT(t.name) as tag_names,
           GROUP_CONCAT(t.id) as tag_ids
    FROM commands c
    LEFT JOIN command_tags ct ON c.id = ct.command_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all();
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(rows.map((row)=>({
            id: String(row.id),
            name: row.name,
            command: row.command,
            description: row.description,
            is_multi_step: Boolean(row.is_multi_step),
            created_at: row.created_at,
            tags: row.tag_names ? row.tag_names.split(',').map((name, index)=>({
                    id: row.tag_ids.split(',')[index],
                    name: name.trim()
                })) : []
        })));
}
async function POST(request) {
    try {
        const body = await request.json();
        const { name, command, description, is_multi_step = false, tagIds = [] } = body;
        if (!name || !command || !description) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'name, command, and description are required'
            }, {
                status: 400
            });
        }
        // Check for duplicate command name (case-insensitive)
        const existingCommand = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare("SELECT id FROM commands WHERE LOWER(name) = LOWER(?)").get(name.trim());
        if (existingCommand) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `A command with the name "${name.trim()}" already exists`
            }, {
                status: 409
            });
        }
        const now = new Date().toISOString();
        const info = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare("INSERT INTO commands (name, command, description, is_multi_step, created_at) VALUES (?, ?, ?, ?, ?)").run(name.trim(), command, description, Number(is_multi_step), now);
        const commandId = String(info.lastInsertRowid);
        // Add tags if provided
        if (tagIds.length > 0) {
            const insertTag = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare("INSERT INTO command_tags (command_id, tag_id, created_at) VALUES (?, ?, ?)");
            for (const tagId of tagIds){
                insertTag.run(Number(commandId), Number(tagId), now);
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            id: commandId,
            name: name.trim(),
            command,
            description,
            is_multi_step: Boolean(is_multi_step),
            created_at: now,
            tags: tagIds.length > 0 ? tagIds.map((tagId)=>({
                    id: tagId,
                    name: ''
                })) : []
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Error creating command:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create command'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7d13ce4a._.js.map