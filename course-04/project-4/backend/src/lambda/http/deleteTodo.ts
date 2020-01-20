import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTodoItem } from '../../businessLogic/todoBusinessLogic'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
{
  // Extract the TODO ID from the path
  const todoId = event.pathParameters.todoId
  
  // Find User ID within JWT
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ')
  const jwtToken = split[1]

  // Delete item from the list
  await deleteTodoItem(todoId, jwtToken)
  return {
    statusCode: 201,
    body: "{}"
  }
})

handler.use(cors({credentials: true}))