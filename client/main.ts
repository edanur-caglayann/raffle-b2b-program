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
  import { Counter, CounterSchema, Raffle, RaffleName, RaffleSchema } from "./models";
  import {connection} from './connection';
  import {authority, raffle_program, entropy_account, fee_account, rng_program} from "./accounts"
  import { deserialize_counter_account_data, deserialize_participation_account_data, numberToLEBytes8, stringToNumberArray32Bytes } from "./utils";
  import { get_all_raffles, get_raffle_by_raffle_no } from "./get_info";



  const init_raffle = async (raffle_name:string) => {
  
  
       const counter_account = PublicKey.findProgramAddressSync([Buffer.from("counter")],raffle_program)[0]

       const counter_info = await connection.getAccountInfo(counter_account);

       const counter = deserialize(CounterSchema,Counter,counter_info?.data!);

       counter.number_of_raffles = BigInt(Number(counter.number_of_raffles) + 1);

       const le_bytes = numberToLEBytes8(counter.number_of_raffles)

       const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),le_bytes],raffle_program)[0]
     
       const raffle_name_array = stringToNumberArray32Bytes(raffle_name)

       const concated = Uint8Array.of(0, ...raffle_name_array);
       
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

  const add_wallets = async (raffle_no:bigint) => {
  
  
   const le_bytes = numberToLEBytes8(raffle_no)

   const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),le_bytes],raffle_program)[0];


   const raffle_account_info = await connection.getAccountInfo(raffle_account);

   const raffle = deserialize(RaffleSchema,Raffle,raffle_account_info?.data!);

   console.log(raffle.number_of_participants.toString())

   
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_2_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_3_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_4_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_5_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_6_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_7_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_8_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_9_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_10_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_11_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_12_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_13_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_14_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_15_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_16_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_17_le_bytes = numberToLEBytes8(raffle.number_of_participants);
   raffle.number_of_participants = BigInt(Number(raffle.number_of_participants) + 1);
   const participant_no_18_le_bytes = numberToLEBytes8(raffle.number_of_participants);

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
   const user_16 = Keypair.generate().publicKey;
   const user_17 = Keypair.generate().publicKey;
   const user_18 = Keypair.generate().publicKey;

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
   const user_pda_16 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_16_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_17 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_17_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];
   const user_pda_18 = PublicKey.findProgramAddressSync([Buffer.from("part"), participant_no_18_le_bytes,Buffer.from("raf"),le_bytes],raffle_program)[0];


    const ix = new TransactionInstruction({
      programId: raffle_program,
      keys: [
        { isSigner: true, isWritable: true, pubkey: authority.publicKey },
        { isSigner: false, isWritable: true, pubkey: raffle_account },
        { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
        {isSigner:false, isWritable:true, pubkey: user}, 
        {isSigner:false, isWritable:true, pubkey: user_pda},
        {isSigner:false, isWritable:true, pubkey: user_2},
        {isSigner:false, isWritable:true, pubkey: user_pda_2},
        {isSigner:false, isWritable:true, pubkey: user_3},
        {isSigner:false, isWritable:true, pubkey: user_pda_3},
        {isSigner:false, isWritable:true, pubkey: user_4},
        {isSigner:false, isWritable:true, pubkey: user_pda_4},
        {isSigner:false, isWritable:true, pubkey: user_5},
        {isSigner:false, isWritable:true, pubkey: user_pda_5},
        {isSigner:false, isWritable:true, pubkey: user_6},
        {isSigner:false, isWritable:true, pubkey: user_pda_6},
        {isSigner:false, isWritable:true, pubkey: user_7},
        {isSigner:false, isWritable:true, pubkey: user_pda_7},
        {isSigner:false, isWritable:true, pubkey: user_8},
        {isSigner:false, isWritable:true, pubkey: user_pda_8},
        {isSigner:false, isWritable:true, pubkey: user_9 },
        {isSigner:false, isWritable:true, pubkey: user_pda_9},
        {isSigner:false, isWritable:true, pubkey: user_10},
        {isSigner:false, isWritable:true, pubkey: user_pda_10},
        {isSigner:false, isWritable:true, pubkey: user_11},
        {isSigner:false, isWritable:true, pubkey: user_pda_11},
        {isSigner:false, isWritable:true, pubkey: user_12},
        {isSigner:false, isWritable:true, pubkey: user_pda_12},
        {isSigner:false, isWritable:true, pubkey: user_13},
        {isSigner:false, isWritable:true, pubkey: user_pda_13},
        {isSigner:false, isWritable:true, pubkey: user_14},
        {isSigner:false, isWritable:true, pubkey: user_pda_14},
        {isSigner:false, isWritable:true, pubkey: user_15},
        {isSigner:false, isWritable:true, pubkey: user_pda_15},
      ],
      data: Buffer.from([1])
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


add_wallets(BigInt(1))