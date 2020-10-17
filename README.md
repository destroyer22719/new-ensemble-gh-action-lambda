.env
```
JWT_SECRET: string! - The JWT secret
DB_URL: string! - Your postgres url

FB_APP_ID: number? - The Facebook App ID
FB_APP_SECRET: string? - The Facebook App Secret
DB_TEST_URL: string? - Your postgres url for tests (do not use the same one)
DEV_USER_ID: string? - uuid of the user to impersonate
REDIS_URL: string? - URL of redis. Otherwise uses a JS object.
```