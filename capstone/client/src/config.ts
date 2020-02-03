// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'ro8fbpfxr9'
export const apiEndpoint = `https://${apiId}.execute-api.eu-west-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain      : 'dev-7z7k9pni.auth0.com',            // Auth0 domain
  clientId    : '0uOrGQ2g1l5md4C7epRZkVhtWcUyHb5j',  // Auth0 client id
  callbackUrl : 'http://localhost:3000/callback'
}