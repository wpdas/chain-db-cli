import ora from "ora";
import chalk from "chalk";
import { getApiUrl, loadToken } from "../../utils/api";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: string[];
}

export async function listTables(): Promise<void> {
  const spinner = ora("Fetching tables...").start();

  try {
    // Get the API URL for the tables endpoint
    const url = getApiUrl("tables");

    // Get the authentication token
    const tokenData = loadToken();
    if (!tokenData) {
      spinner.fail(
        chalk.red(
          "Authentication error: Please connect to a database first using 'chaindb db connect'"
        )
      );
      process.exit(1);
      return;
    }

    // Make the request to the API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${tokenData.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Parse the response
    const data: ApiResponse = await response.json();

    if (!data.success) {
      spinner.fail(chalk.red(`Failed to fetch tables: ${data.message}`));
      process.exit(1);
      return;
    }

    spinner.succeed(chalk.green("Tables fetched successfully!"));

    // Display the tables
    if (data.data && data.data.length > 0) {
      console.log(chalk.bold("\nAvailable tables:"));
      data.data.forEach((table, index) => {
        console.log(`${index + 1}. ${chalk.cyan(table)}`);
      });
    } else {
      console.log(chalk.yellow("\nNo tables found in the database."));
    }
    process.exit(0);
  } catch (error: any) {
    spinner.fail(chalk.red(`Failed to fetch tables: ${error.message}`));
    process.exit(1);
  }
}
