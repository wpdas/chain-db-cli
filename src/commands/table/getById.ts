import chalk from "chalk";
import ora from "ora";
import { apiRequest } from "../../utils/api";

interface GetByIdOptions {
  docId: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function getTableById(
  tableName: string,
  options: GetByIdOptions
): Promise<void> {
  const spinner = ora(
    `Fetching record with ID '${options.docId}' from table '${tableName}'...`
  ).start();

  try {
    // Use the new direct route to get a document by doc_id
    const response = await apiRequest<ApiResponse>(
      "GET",
      `table/${tableName}/doc/${options.docId}`
    );

    if (response.success) {
      spinner.succeed(chalk.green(`Record fetched successfully!`));

      // Check if data was found
      if (response.data) {
        console.log(chalk.cyan("\nRecord data:"));
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(
          chalk.yellow(
            `\nNo record found with ID '${options.docId}' in table '${tableName}'.`
          )
        );
      }
      process.exit(0);
    } else {
      spinner.fail(chalk.red(`Failed to fetch record: ${response.message}`));
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Error fetching record: ${error.message}`));
    process.exit(1);
  }
}
