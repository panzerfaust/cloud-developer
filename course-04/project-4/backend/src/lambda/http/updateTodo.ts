import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { updateTodoItem    } from '../../businessLogic/todoBusinessLogic'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  // Extract the TODO ID from the path
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const todoId: string  = event.pathParameters.todoId

  // Find User ID within JWT
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ')
  const jwtToken = split[1]

  // update TODO item for specified user
  await updateTodoItem (updatedTodo, todoId, jwtToken)
  return {
    statusCode: 200,
    body: '{}'
  }
  return undefined
})

handler.use(cors({credentials: true}))