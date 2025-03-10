#!/usr/bin/env node

// Suppress deprecation warnings
process.env.NODE_NO_WARNINGS = "1";

// Check Node.js version
const requiredNodeVersion = "20.18.3";
const currentNodeVersion = process.versions.node;

function compareVersions(v1: string, v2: string): number {
  const v1Parts = v1.split(".").map(Number);
  const v2Parts = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }

  return 0;
}

if (compareVersions(currentNodeVersion, requiredNodeVersion) < 0) {
  console.error(
    `Error: ChainDB CLI requires Node.js version ${requiredNodeVersion} or higher.`
  );
  console.error(`You are using version ${currentNodeVersion}.`);
  console.error("Please update Node.js to continue.");
  process.exit(1);
}

import { Command } from "commander";
// Usando require para o chalk para garantir compatibilidade
const chalk = require("chalk");
import dotenv from "dotenv";
import { createDatabase } from "./commands/database/create";
import { connectDatabase } from "./commands/database/connect";
import { changePassword } from "./commands/database/changePassword";
import { updateTable } from "./commands/table/update";
import { getTable } from "./commands/table/get";
import { getTableById } from "./commands/table/getById";
import { persistTable } from "./commands/table/persist";
import { getTableHistory } from "./commands/table/history";
import { findWhere } from "./commands/table/findWhere";
import { findWhereAdvanced } from "./commands/table/findWhereAdvanced";
import { listTables } from "./commands/table/list";
import { configCommand } from "./commands/config";
import packageJson from "../package.json";

// Load environment variables
dotenv.config();

const program = new Command();

// Program information
program
  .name("chaindb")
  .description("CLI to interact with ChainDB")
  .version(packageJson.version);

// Configuration command
program
  .command("config")
  .description("Configure the ChainDB host")
  .option("-h, --host <host>", "ChainDB host (e.g., http://localhost:2818)")
  .action(configCommand);

// Database commands
const databaseCommand = program
  .command("db")
  .description("Database-related commands");

databaseCommand
  .command("create")
  .description("Create a new database")
  .requiredOption("-n, --name <name>", "Database name")
  .requiredOption("-u, --user <user>", "Username")
  .requiredOption("-p, --password <password>", "Password")
  .action(createDatabase);

databaseCommand
  .command("connect")
  .description("Connect to an existing database")
  .requiredOption("-n, --name <name>", "Database name")
  .requiredOption("-u, --user <user>", "Username")
  .requiredOption("-p, --password <password>", "Password")
  .action(connectDatabase);

databaseCommand
  .command("change-password")
  .description("Change database password")
  .requiredOption("-n, --name <name>", "Database name")
  .requiredOption("-u, --user <user>", "Username")
  .requiredOption("-o, --old-password <oldPassword>", "Current password")
  .requiredOption("-p, --new-password <newPassword>", "New password")
  .action(changePassword);

// Table commands
const tableCommand = program
  .command("table")
  .description("Table-related commands");

tableCommand
  .command("get <tableName>")
  .description("Get current table data (the last record stored in the table)")
  .action(getTable);

tableCommand
  .command("get-by-id <tableName>")
  .description("Get a specific record from table by document ID")
  .requiredOption("--doc-id <docId>", "Document ID to fetch")
  .action(getTableById);

tableCommand
  .command("update <tableName>")
  .description("Update a specific record in table by document ID")
  .requiredOption("-d, --data <data>", "Data in JSON format")
  .requiredOption("--doc-id <docId>", "Document ID of the record to update")
  .action(updateTable);

tableCommand
  .command("persist <tableName>")
  .description("Persist new data to table")
  .requiredOption("-d, --data <data>", "Data in JSON format")
  .action(persistTable);

tableCommand
  .command("history <tableName>")
  .description("Get table history")
  .option("-l, --limit <limit>", "Record limit", "10")
  .action(getTableHistory);

tableCommand
  .command("find <tableName>")
  .description("Search records with simple criteria")
  .requiredOption("-c, --criteria <criteria>", "Search criteria in JSON format")
  .option("-l, --limit <limit>", "Record limit", "10")
  .option("-r, --reverse", "Search from newest to oldest", true)
  .action(findWhere);

tableCommand
  .command("find-advanced <tableName>")
  .description("Search records with advanced criteria")
  .requiredOption("-c, --criteria <criteria>", "Search criteria in JSON format")
  .option("-l, --limit <limit>", "Record limit", "10")
  .option("-r, --reverse", "Search from newest to oldest", true)
  .action(findWhereAdvanced);

tableCommand.command("list").description("List all tables").action(listTables);

// Parse arguments
program.parse(process.argv);

// If no command is provided, display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
