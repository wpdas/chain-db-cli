import chalk from "chalk";
import ora from "ora";
import { apiRequest } from "../../utils/api";

interface UpdateTableOptions {
  data: string;
  docId: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function updateTable(
  tableName: string,
  options: UpdateTableOptions
): Promise<void> {
  const spinner = ora(`Updating record in table '${tableName}'...`).start();

  try {
    // Convert JSON string to object
    let dataObj;
    try {
      dataObj = JSON.parse(options.data);
    } catch (error) {
      spinner.fail(chalk.red("Error: The provided data is not valid JSON."));
      process.exit(1);
    }

    // Prepare request payload with required doc_id
    const payload = {
      data: dataObj,
      doc_id: options.docId,
    };

    const response = await apiRequest<ApiResponse>(
      "POST",
      `table/${tableName}/update`,
      payload
    );

    if (response.success) {
      spinner.succeed(
        chalk.green(`Record in table '${tableName}' updated successfully!`)
      );

      // Display updated data
      if (response.data) {
        console.log(chalk.cyan("\nUpdated record:"));
        console.log(JSON.stringify(response.data, null, 2));
      }
      process.exit(0);
    } else {
      spinner.fail(chalk.red(`Failed to update record: ${response.message}`));
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Error updating record: ${error.message}`));
    process.exit(1);
  }
}
