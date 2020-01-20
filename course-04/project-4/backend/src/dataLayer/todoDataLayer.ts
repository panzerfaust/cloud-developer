import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({signatureVersion: 'v4'})
import {DeleteObjectOutput} from 'aws-sdk/clients/s3'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItems'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('todo')

export class TodoDataLayer {

  //set initial class object values
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODO_TABLE) {}

  async getTodoList(userId: string): Promise<TodoItem[]> 
  {
    logger.info('Getting all TODO items for current user')
    const result = 
    await this.docClient
      .query({
        TableName: this.todoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: 
        {
          ':userId': userId
        }
      }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodoItem(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating TODO item for current user')
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()
    
    return todo
  }

  async updateTodoItem (
    todo: TodoUpdate,
    todoId: string,
    userId: string)
  {
    // update a specified item belonging to a specific user
    logger.info('Updating TODO item for current user',
    {
      user: userId,
      todo
    })
    await this.docClient.update (
      {
        TableName: this.todoTable,
        Key :
        {
          'userId': userId,
          'todoId': todoId
        },
        UpdateExpression: 'set #name = :n, dueDate = :dd, done = :d',
        ExpressionAttributeNames:
        {
          '#name' : 'name',
        },
        ExpressionAttributeValues:
        {
          ':n': todo.name,
          ':dd': todo.dueDate,
          ':d': todo.done,
        },
        ReturnValues:"UPDATED_NEW"
      }).promise()
  }
  
  async updateTodoItemAttachment (
    attachmentUrl: string,
    todoId: string,
    userId: string)
  {
    logger.info('Updating TODO item image URL for current user')
    
    // update the attachment URL according to user
    await this.docClient.update (
      {
        TableName: this.todoTable,
        Key :
        {
          'userId': userId,
          'todoId': todoId
        },
        UpdateExpression: 'set attachmentUrl = :url',
        ExpressionAttributeValues:
        {
          ':url': attachmentUrl
        },
        ReturnValues:"UPDATED_NEW"
      }).promise()
  }

  //Fetches entries from DDB table
  async getTodoItem (todoId: string, userId: string) : Promise <TodoItem>
  {
    logger.info('Fetching TODO item for current user')
    const pull = await this.docClient
    .query({
      TableName: this.todoTable,
      KeyConditionExpression: 'userId = :userId, todoId = :todoId',
      ExpressionAttributeValues: 
      {
        ':userId': userId,
        ':todoId': todoId
      }
    }).promise()

    return pull.Items[0] as TodoItem
  }

  //Delete entry from DDB Table
  async deleteTodoItem (todoId: string, userId: string)
  {
    logger.info('Deleting TODO item for current user')

    await this.docClient.delete (
      {
        TableName: this.todoTable,
        Key : 
        {
          "userId": userId,
          "todoId": todoId
        }
      }).promise()
  }

  //Delete the attached image from s3 bucket
  async deleteTodoItemAttachment (todoId: string): Promise<DeleteObjectOutput>
  {
    logger.info('Deleting TODO item image URL for current user')
    return await s3.deleteObject(
      {
        Bucket: this.todoTable, 
        Key: todoId
      }).promise()
  }

  //  async generateUploadUrl (todoId: string, userId: string)
  // {
  //   logger.info('Creating TODO item image URL for current user')
  //   const bucketName    = process.env.TODO_S3_BUCKET
  //   const urlExpiration = process.env.SIGNED_URL_EXPIRATION
  //   const url : string = getUploadUrl(todoId, userId)

  //   this.updateTodoItemAttachment(
  //     `https://${bucketName}.s3.amazonaws.com/${todoId}`,
  //     todoId,
  //     userId)
      
  //   // retrieve signed URL and return it
  //   return s3.getSignedUrl('putObject', {
  //     Bucket: bucketName,
  //     Key: todoId,
  //     Expires: urlExpiration
  //   })
  // }

}

//For testing DynamoDB instance locally when there is no connection to the server
function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new XAWS.DynamoDB.DocumentClient()
}