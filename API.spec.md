### Base URL: https://api.nova.com/api

All endpoints require auth via Authorization: Bearer `token` header.

### `GET /me`

Purpose: Get current user state: score, active guess

Response 200:

```json
{
  "userId": "user_123",
  "score": 4,
  "guessesMade": 10,
  "guessesLost": 7,
  "guessesPending": 0,
  "email": "ejiro.asiuwhu@gmail.com",
  "name": "Ejiro Asiuwhu",
  "activeGuess": {
    "guessId": "g_abc",
    "direction": "up",
    "startPrice": 68234.92,
    "createdAt": "2025-04-09T15:00:00Z",
    "resolved": false
  }
}
```

### `GET /price`

Purpose: Get current price of the asset (BTC/USD price)

Response 200:

```json
{
  "price": 68321.74,
  "fetchedAt": "2025-04-09T15:00:12Z"
}
```

### `POST /guess`

Purpose: Make a new guess (only active guess per user)

Request Body:

```json
{
  "direction": "up" // "up" or "down"
}
```

Response 200:

```json
{
  "guessId": "gus_yserdf43",
  "direction": "up",
  "startPrice": 68234.92,
  "createdAt": "2025-04-09T15:00:00Z"
}
```

Errors:

`409 Conflict`: already has active unresolved guess

`400 Bad Request`: invalid direction (not "up" or "down")

### `GET /guess/:guessId`

Purpose: Fetch status of a specific guess (polling)

Response 200:

```json
{
  "guessId": "gus_yserdf43",
  "userId": "user_123",
  "direction": "up",
  "startPrice": 68234.92,
  "endPrice": 68300.12,
  "createdAt": "2025-04-09T15:00:00Z",
  "resolved": true,
  "result": "correct" // "correct" or "incorrect"
}
```
