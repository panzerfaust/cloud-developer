import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItems'
import { TodoDataLayer } from '../dataLayer/todoDataLayer'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

// Create objects 
const todoDL = new TodoDataLayer()

//gets TODO items from the table
export async function getTodoList(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoDL.getTodoList(userId)
}

//Creates TODO item in table with unique todoId
export async function createTodoItem(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string): Promise<TodoItem> 
{
  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)
  const item = await todoDL.createTodoItem(
    {
      userId,
      todoId: itemId,
      createdAt: new Date().toISOString(),
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false//,
    })
  return item
}

//Updates fields 
export async function updateTodoItem (
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  jwtToken: string)
{
  const userId = parseUserId(jwtToken)
  await todoDL.updateTodoItem(updateTodoRequest,todoId, userId)
}

//Delete an item from the table
export async function deleteTodoItem (id: string, jwtToken: string)
{
  const userId = parseUserId(jwtToken)
  await todoDL.deleteTodoItem(id, userId)
}

// Code not doing anything yet as function doing all the work
export async function generateUploadUrl(todoId: string, attachmentUrl: string, jwtToken: string): Promise<void> {
  const userId = parseUserId(jwtToken);
  const todo = await todoDL.getTodoItem(todoId, userId)

  todoDL.generateUploadUrl(todo.todoId, todo.userId, attachmentUrl)
}