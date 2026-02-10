```
Frontend <br>
  └─ Clerk handles login/signup 
       └─ Issues JWT  
Frontend → Backend API 
  └─ Authorization: Bearer <Clerk JWT> 

Backend <br>
  ├─ Verify JWT (Clerk public keys) 
  ├─ Extract clerkUserId 
  ├─ Load internal user from DB 
  ├─ Enforce authorization 
  └─ Execute business logic 
```