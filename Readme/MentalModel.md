```
Frontend <br>
  └─ Clerk handles login/signup <br>
       └─ Issues JWT  <br>
Frontend → Backend API <br>
  └─ Authorization: Bearer <Clerk JWT> <br>

Backend <br>
  ├─ Verify JWT (Clerk public keys) <br>
  ├─ Extract clerkUserId <br>
  ├─ Load internal user from DB <br>
  ├─ Enforce authorization <br>
  └─ Execute business logic <br>
```