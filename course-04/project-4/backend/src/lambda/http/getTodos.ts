import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import {getTodoList} from '../../businessLogic/todoBusinessLogic'

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  // TODO: Get all TODO items for a current user
  // Find User ID within JWT
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ')
  const jwtToken = split[1];

  // Get the list of TODO items for the user specified by JWT
  const list = await getTodoList(jwtToken)
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: list
    })
  }
})

handler.use(cors({credentials: true}))