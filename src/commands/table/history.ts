import chalk from "chalk";
import ora from "ora";
import { apiRequest } from "../../utils/api";

interface HistoryOptions {
  limit: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any[];
}

export async function getTableHistory(
  tableName: string,
  options: HistoryOptions
): Promise<void> {
  const spinner = ora(`Getting history from table '${tableName}'...`).start();

  try {
    const limit = parseInt(options.limit);

    if (isNaN(limit) || limit <= 0) {
      spinner.fail(chalk.red("Error: The limit must be a positive number."));
      process.exit(1);
    }

    const response = await apiRequest<ApiResponse>(
      "GET",
      `table/${tableName}/history?limit=${limit}`
    );

    if (response.success) {
      spinner.succeed(
        chalk.green(`History from table '${tableName}' retrieved successfully!`)
      );

      // Display history
      if (response.data && response.data.length > 0) {
        console.log(
          chalk.cyan(`\nHistory (last ${response.data.length} records):`)
        );

        response.data.forEach((record, index) => {
          console.log(chalk.yellow(`\n[Record ${index + 1}]`));
          console.log(JSON.stringify(record, null, 2));
        });
      } else {
        console.log(chalk.yellow("\nNo records found in history."));
      }
      process.exit(0);
    } else {
      spinner.fail(
        chalk.red(`Failed to get table history: ${response.message}`)
      );
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Error getting table history: ${error.message}`));
    process.exit(1);
  }
}
