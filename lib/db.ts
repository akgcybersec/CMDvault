import Database from "better-sqlite3"
import path from "path"
import fs from "fs"
import bcrypt from "bcryptjs"

const dataDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, "database.db")

const db = new Database(dbPath)

db.pragma("journal_mode = WAL")

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
`)

// Skip seeding during Next.js build to prevent SQLite locking
const isBuilding = process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "production" && process.env.NEXT_RUNTIME === "edge"

if (!isBuilding) {
  // Seed default data if empty
  const userCount = (db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }).count
  if (userCount === 0) {
    const hashedAdminPassword = bcrypt.hashSync("admin", 10)
    db.prepare("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)").run("admin", hashedAdminPassword)
  }

  const tagCount = (db.prepare("SELECT COUNT(*) as count FROM tags").get() as { count: number }).count
  if (tagCount === 0) {
    const now = new Date().toISOString()
    const insertTag = db.prepare("INSERT INTO tags (name, created_at) VALUES (?, ?)")
    const reconTag = insertTag.run("Reconnaissance", now).lastInsertRowid as number
    const enumTag = insertTag.run("Enumeration", now).lastInsertRowid as number
    const exploitTag = insertTag.run("Exploitation", now).lastInsertRowid as number

    const insertCmd = db.prepare("INSERT INTO commands (name, command, description, is_multi_step, created_at) VALUES (?, ?, ?, ?, ?)")
    const insertCmdTag = db.prepare("INSERT INTO command_tags (command_id, tag_id, created_at) VALUES (?, ?, ?)")
    
    const cmd1 = insertCmd.run("Nmap Port Scan", "nmap -sS -p- {{target}}", "Perform a full TCP port scan using Nmap", 0, now).lastInsertRowid as number
    const cmd2 = insertCmd.run("Subdomain Enumeration", "subfinder -d {{target}}", "Find subdomains using Subfinder", 0, now).lastInsertRowid as number
    const cmd3 = insertCmd.run("Service Version Detection", "nmap -sV -p {{port}} {{target}}", "Detect service versions on open ports", 0, now).lastInsertRowid as number
    const cmd4 = insertCmd.run("SSH Brute Force", "hydra -l admin -P /path/to/wordlist.txt ssh://{{target}} -p {{port}}", "Brute force SSH using Hydra", 0, now).lastInsertRowid as number
    const cmd5 = insertCmd.run("SQL Injection Test", "sqlmap -u \"{{url}}\" --batch --dbs", "Run SQLMap against a URL", 0, now).lastInsertRowid as number

    // Assign tags to commands
    insertCmdTag.run(cmd1, reconTag, now)
    insertCmdTag.run(cmd2, reconTag, now)
    insertCmdTag.run(cmd3, enumTag, now)
    insertCmdTag.run(cmd4, enumTag, now)
    insertCmdTag.run(cmd5, exploitTag, now)
  }

  const placeholderCount = (db.prepare("SELECT COUNT(*) as count FROM placeholders").get() as { count: number }).count
  if (placeholderCount === 0) {
    const now = new Date().toISOString()
    db.prepare("INSERT OR IGNORE INTO placeholders (name, created_at) VALUES (?, ?)").run("target", now)
    db.prepare("INSERT OR IGNORE INTO placeholders (name, created_at) VALUES (?, ?)").run("ip", now)
    db.prepare("INSERT OR IGNORE INTO placeholders (name, created_at) VALUES (?, ?)").run("port", now)
    db.prepare("INSERT OR IGNORE INTO placeholders (name, created_at) VALUES (?, ?)").run("url", now)
    db.prepare("INSERT OR IGNORE INTO placeholders (name, created_at) VALUES (?, ?)").run("wordlist", now)
  }
}

export default db
