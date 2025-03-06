import chalk from "chalk";
import ora from "ora";
import { apiRequest } from "../../utils/api";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function getTable(tableName: string): Promise<void> {
  const spinner = ora(`Getting data from table '${tableName}'...`).start();

  try {
    const response = await apiRequest<ApiResponse>("GET", `table/${tableName}`);

    if (response.success) {
      spinner.succeed(
        chalk.green(`Data from table '${tableName}' retrieved successfully!`)
      );

      // Display formatted data
      console.log(chalk.cyan("\nCurrent data:"));
      console.log(JSON.stringify(response.data, null, 2));
      process.exit(0);
    } else {
      spinner.fail(chalk.red(`Failed to get table data: ${response.message}`));
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Error getting table data: ${error.message}`));
    process.exit(1);
  }
}
