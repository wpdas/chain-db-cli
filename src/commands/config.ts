import fs from "fs";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";

interface ConfigOptions {
  host?: string;
}

const CONFIG_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE || "",
  ".chaindb-config.json"
);

// Function to load configuration
export function loadConfig(): { host: string } {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      return { host: config.host || "http://localhost:2818" };
    }
  } catch (error) {
    console.error(chalk.yellow("Warning: Could not load configuration file."));
  }

  return { host: "http://localhost:2818" };
}

// Function to save configuration
function saveConfig(config: { host: string }): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(chalk.red("Error saving configuration file."));
    throw error;
  }
}

// Configuration command
export async function configCommand(options: ConfigOptions): Promise<void> {
  const spinner = ora("Configuring ChainDB CLI...").start();

  try {
    const currentConfig = loadConfig();

    // If host was provided as an option, use it
    if (options.host) {
      saveConfig({ host: options.host });
      spinner.succeed(chalk.green(`Host configured to: ${options.host}`));
      process.exit(0);
      return;
    }

    // Otherwise, ask the user
    spinner.stop();

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "host",
        message: "Enter the ChainDB host:",
        default: currentConfig.host,
        validate: (input: string) => {
          if (!input) return "Host cannot be empty";
          if (!input.startsWith("http://") && !input.startsWith("https://")) {
            return "Host must start with http:// or https://";
          }
          return true;
        },
      },
    ]);

    saveConfig({ host: answers.host });
    console.log(chalk.green(`Host configured to: ${answers.host}`));
    process.exit(0);
  } catch (error: any) {
    spinner.fail(chalk.red(`Configuration error: ${error.message}`));
    process.exit(1);
  }
}
