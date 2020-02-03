import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import Axios from 'axios'
import { AxiosResponse } from 'axios'
import { JWKS } from '../../auth/Jwk'
import { JwtPayload } from '../../auth/JwtPayload'

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set

const jwkUrl = 'https://dev-7z7k9pni.auth0.com/.well-known/jwks.json'

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken : JwtPayload = await verifyToken(event.authorizationToken)
    
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) 
  {
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> 
{
  const token = getToken(authHeader)

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  //The JWK is used to validate a signed JWT
  const jwk : AxiosResponse <JWKS> = await Axios.get(jwkUrl)
  const cert : string = certToPEM(jwk.data.keys[0].x5c[0])

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1];

  return token
}

//function to breakup JWT - found from:
//https://gist.github.com/chatu/7738411c7e8dcf604bc5a0aad7937299
function certToPEM(cert : string) : string {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  
  return cert
}