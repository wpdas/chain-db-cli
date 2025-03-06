import chalk from "chalk";
import ora from "ora";
import { apiRequest } from "../../utils/api";

interface PersistTableOptions {
  data: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function persistTable(
  tableName: string,
  options: PersistTableOptions
): Promise<void> {
  const spinner = ora(`Persisting new data to table '${tableName}'...`).start();

  try {
    // Convert JSON string to object
    let dataObj;
    try {
      dataObj = JSON.parse(options.data);
    } catch (error) {
      spinner.fail(chalk.red("Error: The provided data is not valid JSON."));
      process.exit(1);
    }

    const response = await apiRequest<ApiResponse>(
      "POST",
      `table/${tableName}/persist`,
      { data: dataObj }
    );

    if (response.success) {
      spinner.succeed(
        chalk.green(`New data persisted to table '${tableName}' successfully!`)
      );

      // Display persisted data
      if (response.data) {
        console.log(chalk.cyan("\nPersisted data:"));
        console.log(JSON.stringify(response.data, null, 2));
      }
      process.exit(0);
    } else {
      spinner.fail(
        chalk.red(`Failed to persist data to table: ${response.message}`)
      );
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Error persisting data to table: ${error.message}`));
    process.exit(1);
  }
}
