import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItems'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'
//const s3 = new XAWS.S3({signatureVersion: 'v4'})

const logger = createLogger('todo')
const XAWS = AWSXRay.captureAWS(AWS)

export class TodoDataLayer {

  //set initial class object values
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODO_TABLE //,
    //private readonly bucketName    = process.env.TODO_S3_BUCKET,
    //private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {}

  public async getTodoList(userId: string): Promise<TodoItem[]> 
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

  public async createTodoItem(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating TODO item for current user')
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()
    
    return todo
  }

  public async updateTodoItem (
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
        ReturnValues: 'UPDATED_NEW'
      }).promise()
  }
  
  public async updateTodoItemAttachment (
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
  public async getTodoItem (todoId: string, userId: string) : Promise <TodoItem>
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
  public async deleteTodoItem (todoId: string, userId: string)
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

  // Code not doing anything yet as function doing all the work
  public async generateUploadUrl(todoId: string, userId: string, attachmentUrl: string): Promise<void> {
    this.docClient
        .update({
            TableName: this.todoTable,
            Key: 
            {
              "userId": userId,
              "todoId": todoId
            },
            UpdateExpression: 'uploadUrl = :uploadUrl',
            ExpressionAttributeValues: 
            {
                ':attachmentUrl': attachmentUrl,
            },
            ReturnValues: 'Updated'
        })
        .promise();
  }
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