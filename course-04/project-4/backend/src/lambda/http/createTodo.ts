import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodoItem } from '../../businessLogic/todoBusinessLogic'
import { cors } from 'middy/middlewares'
import * as middy from 'middy'

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  // Find User ID within JWT
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ')
  const jwtToken = split[1]

  // create a new TODO item for user
  const item = await createTodoItem(newTodo, jwtToken)
  return {
    statusCode: 201,
    body: JSON.stringify({item})
  }
})

handler.use(cors({credentials: true}))