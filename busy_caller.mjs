import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda"
const lambdaClient = new LambdaClient({ maxAttempts: 10 })

// Cache the list of lambda Functions in a global variable
// so it's only queried on the cold start
let lambdaFunctions = [process.env.TARGET_FUNC_ARN]

const keepInvokingLambdaFunction = async (context) => {
  // Stop if there isn't enough time left, 2s added for buffering, so the function
  // doesn't get terminated in the middle of invoking other functions.
  while (
    context.getRemainingTimeInMillis() >
    parseInt(process.env.freq) + 2000
  ) {
    await new Promise((resolve) => setTimeout(resolve, process.env.freq)) // sleep
    await Promise.all(lambdaFunctions.map(invokeLambdaFunction)) // invoke the functions
  }
}

const invokeLambdaFunction = async (lambdaFunction) => {
  await lambdaClient.send(
    new InvokeCommand({
      FunctionName: lambdaFunction,
      InvocationType: "Event",
    })
  )
  console.log(`Invoked function ${lambdaFunction}`)
}

export async function handler(event, context) {
  await keepInvokingLambdaFunction(context)

  const response = {
    statusCode: 200,
    body: "Busy functions invoked",
  }
  return response
}
