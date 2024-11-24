import {
    Keypair,
    PublicKey,
    TransactionMessage,
    VersionedTransaction,
    SystemProgram,
    TransactionInstruction,
    LAMPORTS_PER_SOL,
    Connection,
    AddressLookupTableProgram,
    Transaction,
  } from "@solana/web3.js";

  import { deserialize, serialize } from "borsh";
  import { Batch, BatchSchema, Counter, CounterSchema, Raffle, RaffleName, RaffleSchema } from "./models";
  import {connection} from './connection';
  import {authority, raffle_program, entropy_account, fee_account, rng_program} from "./accounts"
  import { deserialize_counter_account_data, deserialize_participation_account_data, deserialize_raffle_account_data, numberToLEBytes8, stringToNumberArray32Bytes } from "./utils";
  import { get_all_raffles, get_raffle_by_raffle_no } from "./get_info";



  const init_raffle = async (raffle_name:string, number_of_participants:bigint) => {
  
  
       const counter_account = PublicKey.findProgramAddressSync([Buffer.from("counter")],raffle_program)[0]

       const counter_info = await connection.getAccountInfo(counter_account);

       const counter = deserialize(CounterSchema,Counter,counter_info?.data!);

       counter.number_of_raffles = BigInt(Number(counter.number_of_raffles) + 1);

       const le_bytes = numberToLEBytes8(counter.number_of_raffles)

       const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),le_bytes],raffle_program)[0]

       const raffle_name_array = stringToNumberArray32Bytes(raffle_name)

       const raffle = new Raffle();

       raffle.number_of_participants = number_of_participants;
       raffle.raffle_name = raffle_name_array;

       const raffle_serialized = serialize(RaffleSchema,raffle);

       const concated = Uint8Array.of(0, ...raffle_serialized);

       console.log(concated.length)

       const ix = new TransactionInstruction({
         programId: raffle_program,
         keys: [
           { isSigner: true, isWritable: true, pubkey: authority.publicKey },
           { isSigner: false, isWritable: true, pubkey: raffle_account },
           { isSigner: false, isWritable: true, pubkey: counter_account },
           { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
      ],
         data: Buffer.from(concated)
       });

       const message = new TransactionMessage({
         instructions: [ix],
         payerKey: authority.publicKey,
         recentBlockhash: (await connection.getLatestBlockhash()).blockhash
       }).compileToV0Message();

       const tx = new VersionedTransaction(message);
       tx.sign([authority]);

       const sig = connection.sendTransaction(tx);

       console.log("raffle = " + raffle_account.toBase58())
       console.log("counter = " + counter_account.toBase58())

       console.log(sig)
  }

  const add_wallets = async (raffle_no:bigint, batch:bigint) => {
  
    const initial_batch:bigint = batch;
  
   const le_bytes = numberToLEBytes8(raffle_no)

   const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),le_bytes],raffle_program)[0];


   
   batch = BigInt(Number(batch) + 1);
   console.log(batch)
   const participant_no_le_bytes = numberToLEBytes8(batch);
   batch = BigInt(Number(batch) + 1);
   const participant_no_2_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_3_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_4_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_5_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_6_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_7_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_8_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_9_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_10_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_11_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_12_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_13_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_14_le_bytes = numberToLEBytes8(batch);
   console.log(batch)
   batch = BigInt(Number(batch) + 1);
   const participant_no_15_le_bytes = numberToLEBytes8(batch);

   console.log(batch)


   const user = Keypair.generate().publicKey;
   const user_2 = Keypair.generate().publicKey;
   const user_3 = Keypair.generate().publicKey;
   const user_4 = Keypair.generate().publicKey;
   const user_5 = Keypair.generate().publicKey;
   const user_6 = Keypair.generate().publicKey;
   const user_7 = Keypair.generate().publicKey;
   const user_8 = Keypair.generate().publicKey;
   const user_9 = Keypair.generate().publicKey;
   const user_10 = Keypair.generate().publicKey;
   const user_11 = Keypair.generate().publicKey;
   const user_12 = Keypair.generate().publicKey;
   const user_13 = Keypair.generate().publicKey;
   const user_14 = Keypair.generate().publicKey;
   const user_15 = Keypair.generate().publicKey;


   const user_pda = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_2 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_2_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_3 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_3_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_4 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_4_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_5 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_5_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_6 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_6_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_7 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_7_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_8 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_8_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_9 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_9_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_10 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_10_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_11 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_11_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_12 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_12_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_13 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_13_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_14 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_14_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_15 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_15_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];

   const batch_data = new Batch()

   batch_data.batch = initial_batch;

   const batch_serialized = serialize(BatchSchema,batch_data);

   const concated = Uint8Array.of(1, ...batch_serialized);


    const ix = new TransactionInstruction({
      programId: raffle_program,
      keys: [
        { isSigner: true, isWritable: true, pubkey: authority.publicKey },
        { isSigner: false, isWritable: true, pubkey: raffle_account },
        { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
        {isSigner:false, isWritable:false, pubkey: user}, 
        {isSigner:false, isWritable:true, pubkey: user_pda},
        {isSigner:false, isWritable:false, pubkey: user_2},
        {isSigner:false, isWritable:true, pubkey: user_pda_2},
        {isSigner:false, isWritable:false, pubkey: user_3},
        {isSigner:false, isWritable:true, pubkey: user_pda_3},
        {isSigner:false, isWritable:false, pubkey: user_4},
        {isSigner:false, isWritable:true, pubkey: user_pda_4},
        {isSigner:false, isWritable:false, pubkey: user_5},
        {isSigner:false, isWritable:true, pubkey: user_pda_5},
        {isSigner:false, isWritable:false, pubkey: user_6},
        {isSigner:false, isWritable:true, pubkey: user_pda_6},
        {isSigner:false, isWritable:false, pubkey: user_7},
        {isSigner:false, isWritable:true, pubkey: user_pda_7},
        {isSigner:false, isWritable:false, pubkey: user_8},
        {isSigner:false, isWritable:true, pubkey: user_pda_8},
        {isSigner:false, isWritable:false, pubkey: user_9 },
        {isSigner:false, isWritable:true, pubkey: user_pda_9},
        {isSigner:false, isWritable:false, pubkey: user_10},
        {isSigner:false, isWritable:true, pubkey: user_pda_10},
        {isSigner:false, isWritable:false, pubkey: user_11},
        {isSigner:false, isWritable:true, pubkey: user_pda_11},
        {isSigner:false, isWritable:false, pubkey: user_12},
        {isSigner:false, isWritable:true, pubkey: user_pda_12},
        {isSigner:false, isWritable:false, pubkey: user_13},
        {isSigner:false, isWritable:true, pubkey: user_pda_13},
        {isSigner:false, isWritable:false, pubkey: user_14},
        {isSigner:false, isWritable:true, pubkey: user_pda_14},

      ],
      data: Buffer.from(concated)
    });


  
    const message = new TransactionMessage({
      instructions: [ix],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();
  
    const tx = new VersionedTransaction(message);
    tx.sign([authority]);

    connection.sendTransaction(tx);


  }

  const call_rng_choose_winner = async (raffle_no:bigint) => {
  
  

   
    const le_bytes = numberToLEBytes8(raffle_no)
 
    const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),le_bytes],raffle_program)[0];
 
 
   
     const ix = new TransactionInstruction({
       programId: raffle_program,
       keys: [
         { isSigner: true, isWritable: true, pubkey: authority.publicKey },
         { isSigner: false, isWritable: true, pubkey: raffle_account },
         { isSigner: false, isWritable: true, pubkey: entropy_account },
         { isSigner: false, isWritable: true, pubkey: fee_account },
         { isSigner: false, isWritable: false, pubkey: rng_program },
         { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
 
       ],
       data: Buffer.from([2])
     });
   
     const message = new TransactionMessage({
       instructions: [ix],
       payerKey: authority.publicKey,
       recentBlockhash: (await connection.getLatestBlockhash()).blockhash
     }).compileToV0Message();
   
     const tx = new VersionedTransaction(message);
     tx.sign([authority]);
 
     connection.sendTransaction(tx);
  }

  const publish_winner = async (raffle_no:bigint) => {
  
  
   
    const le_bytes = numberToLEBytes8(raffle_no)
 
    const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),le_bytes],raffle_program)[0];
 
 
    const raffle_account_info = await connection.getAccountInfo(raffle_account);
 
    const raffle = deserialize(RaffleSchema,Raffle,raffle_account_info?.data!);
 

    const participant_no_le_bytes = numberToLEBytes8(BigInt(raffle.winner_no.toString()));
   

    const winner = new PublicKey(raffle.winner_wallet);
 
    const winner_pda = PublicKey.findProgramAddressSync(
     [Buffer.from("part"), participant_no_le_bytes,
     Buffer.from("raf"),le_bytes],raffle_program)[0];

     console.log(winner_pda.toBase58())

     const ix = new TransactionInstruction({
       programId: raffle_program,
       keys: [
         { isSigner: true, isWritable: true, pubkey: authority.publicKey },
         { isSigner: false, isWritable: true, pubkey: raffle_account },
         { isSigner: false, isWritable: false, pubkey: winner_pda },
         { isSigner: false, isWritable: true, pubkey: winner },
 
       ],
       data: Buffer.from([3])
     });
   
     const message = new TransactionMessage({
       instructions: [ix],
       payerKey: authority.publicKey,
       recentBlockhash: (await connection.getLatestBlockhash()).blockhash
     }).compileToV0Message();
   
     const tx = new VersionedTransaction(message);
     tx.sign([authority]);
 
     connection.sendTransaction(tx);

     //const account = await connection.getAccountInfo(new PublicKey("EuRb5tnLK893xQCsU9nmhCbYU9Eun7EWbiHyERmnBY2F"))
     //deserialize_participation_account_data(account!)
     
  }

  const init_counter = async () => {
  
  

    const counter_account = PublicKey.findProgramAddressSync([Buffer.from("counter")],raffle_program)[0]
   
     const ix = new TransactionInstruction({
       programId: raffle_program,
       keys: [
         { isSigner: true, isWritable: true, pubkey: authority.publicKey },
         { isSigner: false, isWritable: true, pubkey: counter_account },
         { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
 
       ],
       data: Buffer.from([4])
     });
   
     const message = new TransactionMessage({
       instructions: [ix],
       payerKey: authority.publicKey,
       recentBlockhash: (await connection.getLatestBlockhash()).blockhash
     }).compileToV0Message();
   
     const tx = new VersionedTransaction(message);
     tx.sign([authority]);
 
     connection.sendTransaction(tx);

     console.log(counter_account.toBase58())
  }

  const close_pda = async (raffle_no:bigint,participant_no:bigint) => {
  
  
   
    const raffle_no_le_bytes = numberToLEBytes8(raffle_no)
 
    const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),raffle_no_le_bytes],raffle_program)[0];
 
 
    const participant_no_le_bytes = numberToLEBytes8(participant_no);

 
    const participant_pda = PublicKey.findProgramAddressSync(
     [Buffer.from("part"), participant_no_le_bytes,
     Buffer.from("raf"),raffle_no_le_bytes],raffle_program)[0];
   
     const ix = new TransactionInstruction({
       programId: raffle_program,
       keys: [
         { isSigner: true, isWritable: true, pubkey: authority.publicKey },
         { isSigner: false, isWritable: true, pubkey: raffle_account },
         { isSigner: false, isWritable: true, pubkey: participant_pda },
 
       ],
       data: Buffer.from([5])
     });
   
     const message = new TransactionMessage({
       instructions: [ix],
       payerKey: authority.publicKey,
       recentBlockhash: (await connection.getLatestBlockhash()).blockhash
     }).compileToV0Message();
   
     const tx = new VersionedTransaction(message);
     tx.sign([authority]);
 
     connection.sendTransaction(tx);
  }

  const get_balance = async () => {
  
    const balance_before_tx = await connection.getBalance(authority.publicKey);
    console.log(balance_before_tx.toString())
    //8387751640
    //8386013600

    //8.384528600
    //8.367374160
    //8.36737416 SOL

    //=0.01715444 SOL
  }

  get_balance()

  let batch:bigint = BigInt(0)

  //add_wallets(BigInt(2),batch)

//init_raffle("test raffle",BigInt(30))