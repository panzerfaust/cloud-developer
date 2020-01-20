import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk';
import { parseUserId } from '../../auth/utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import { TodoDataLayer } from '../../dataLayer/todoDataLayer'
//import { generateUploadUrl } from '../../businessLogic/todoBusinessLogic'
import { createLogger } from '../../utils/logger';

// instantiate objects
const todoDL = new TodoDataLayer();
const XAWS = AWSXRay.captureAWS(AWS);
const s3 = new XAWS.S3({signatureVersion: 'v4'})

//environment variables defined in serverless.yaml
const bucketName    = process.env.TODO_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const logger = createLogger('todo')

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // extract the TODO ID from the path
  logger.info('Generate TODO image upload url')
  const todoId = event.pathParameters.todoId
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const userId = parseUserId(split[1])

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const uploadUrl : string = getUploadUrl(todoId, userId)

  return  {
    statusCode: 201,
    body: JSON.stringify(
      {
      todoId: todoId, 
      uploadUrl: uploadUrl
    })
  }
})

function getUploadUrl(todoId: string, userId : string): string {
  
  // update the todo item with the anticipated attachment url
  todoDL.updateTodoItemAttachment(
    `https://${bucketName}.s3.amazonaws.com/${todoId}`,
    todoId,
    userId)

  // retrieve signed URL and return it
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}

handler.use(cors({credentials: true}))