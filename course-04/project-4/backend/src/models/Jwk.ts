// A payload of a JWK 

export interface JWK {
    alg: string
    kty: string
    use: string
    n  : string
    e  : string
    kid: string
    x5t: string
    x5c: string []
  }

export interface JWKS {
    keys: JWK []
}