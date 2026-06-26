# DevConnect APIs

authRouter

- POST /auth/signup
- POST /auth/login
- POST /auth/logout

profileRouter
-GET /profile/view
-PATCH /profile/edit
-PATCH /profile/password

connectionRouter
-POST /request/send/interested/:userId => -POST /request/send/:status/:userId
-POST /request/send/ignored/:userId => -POST /request/send/:status/:userId
-POST /request/review/accepted/:requestId => -POST /request/review/:status/:requestId
-POST /request/review/rejected/:requestId => -POST /request/review/:status/:requestId

userRouter
-GET /user/requests/received
-GET /user/connections
-GET /user/feed - Gets you the profiles of the other users on platform

status - ignore, interested , accepted , rejected
