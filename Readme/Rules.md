Repository: 
  1. Must never have a return type bcz they only return conform documents as results. 
  2. Repository should always be transaction-capable. <br>
    - Repository accepts transaction session?: clientsession. <br>
    - Repository never assumes/start transaction. <br>
    - Repository just passes session to mongoose if provided to start a transaction. <br>
  3. Services only decide wether a transaction is required. 
  4. Repository layer: transaction-aware but transaction-agnostic. 
  5. Use mongooseModel.create() when: <br>
    - inserting one document <br>
    - inserting a small batch <br>
    - you want full schema validation and middleware behavior <br>
  6. Use mongooseModel.insertMany() when: <br>
    - importing large datasets <br>
    - doing admin bulk imports <br>
    - performance matters <br>
    - you don't need per-document lifecycle hooks <br>