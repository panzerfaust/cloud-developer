// A payload of a JWK 

export interface JWK {
  kty: string;
  use: string;
  kid: string;
  x5c: string;
  nbf?: string;
}

export interface JWKS {
    keys: JWK []
}