import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import Axios from 'axios'
import { AxiosResponse } from 'axios'
import { JWKS } from '../../models/Jwk'
import { JwtPayload } from '../../models/JwtPayload'
//import { createLogger } from '../../utils/logger'

//const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// Found on Auth0 under Endpoints/JSON Web Key Set

const jwkUrl = 'https://dev-7z7k9pni.auth0.com/.well-known/jwks.json'

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  //logger.info('Authorizing a user: %s', event.authorizationToken);
  try {
    const jwtToken : JwtPayload = await verifyToken(event.authorizationToken);
    //logger.info('User was authorized', { Token: jwtToken});
    
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
    //logger.error('User not authorized', { error: e.message })

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

  const jwk : AxiosResponse <JWKS> = await Axios.get(jwkUrl);
  const cert : string = certToPEM(jwk.data.keys[0].x5c[0]);

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token
}

function certToPEM(cert : string) : string {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  
  return cert
}