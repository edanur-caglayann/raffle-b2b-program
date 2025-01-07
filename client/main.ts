import {
    Keypair,
    PublicKey,
    TransactionMessage,
    VersionedTransaction,
    SystemProgram,
    TransactionInstruction,
    SYSVAR_RENT_PUBKEY,
    LAMPORTS_PER_SOL,
  } from "@solana/web3.js";

  import { deserialize, serialize } from "borsh";
  import { Counter, CounterSchema, Raffle, RaffleSchema, InitRaffle, InitRaffleSchema } from "./models";
  import {connection} from './connection';
  import { raffle_program, entropy_account, fee_account as rng_program_fee_account, rng_program, token_mint} from "./accounts";
  import { deserialize_raffle_account_data, numberToLEBytes8, stringToNumberArray32Bytes } from "./utils";
  import { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
  import { get_all_participation_accounts_by_raffle_no, get_all_raffles, get_participation_account_by_raffle_noand_winner_no, get_raffle_by_raffle_no, get_terms, get_token_program_and_decimals } from "./get_info";
  import { init_config, init_counter, init_term_account, update_terms } from "./admin";



  const init_raffle = async (raffle_name:string, 
    participants_required:bigint, 
    prize_amount:number, 
    participant_fee:number, 
    initializer:Keypair, 
    token_mint:PublicKey) => {
  
  
       const counter_account = PublicKey.findProgramAddressSync([Buffer.from("counter")],raffle_program)[0]

       const counter_info = await connection.getAccountInfo(counter_account);

       const counter = deserialize(CounterSchema,Counter,counter_info?.data!);

       counter.number_of_raffles = BigInt(Number(counter.number_of_raffles) + 1);

       const le_bytes = numberToLEBytes8(counter.number_of_raffles)

       const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),le_bytes],raffle_program)[0]

       const raffle_name_array = stringToNumberArray32Bytes(raffle_name)

       const [token_program,decimals] = await get_token_program_and_decimals(token_mint)

       const init_raffle = new InitRaffle();

       init_raffle.participants_required = participants_required;
       init_raffle.raffle_name = raffle_name_array;
       init_raffle.decimals = decimals;
       init_raffle.prize_amount = BigInt(prize_amount*Math.pow(10,decimals));
       init_raffle.participation_fee = BigInt(participant_fee*LAMPORTS_PER_SOL);


       const serialized = serialize(InitRaffleSchema,init_raffle);

       const concated = Uint8Array.of(0, ...serialized);


       const initializer_ata = getAssociatedTokenAddressSync(
        token_mint,
        initializer.publicKey,
        false,
        token_program,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const raffle_account_ata = getAssociatedTokenAddressSync(
        token_mint,
        raffle_account,
        true,
        token_program,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

    const term_account = PublicKey.findProgramAddressSync([Buffer.from("term")], raffle_program)[0];


       const ix = new TransactionInstruction({
         programId: raffle_program,
         keys: [
           { isSigner: true, isWritable: true, pubkey: initializer.publicKey },
           { isSigner: false, isWritable: true, pubkey: initializer_ata },
           { isSigner: false, isWritable: true, pubkey: raffle_account },
           { isSigner: false, isWritable: true, pubkey: raffle_account_ata },
           { isSigner: false, isWritable: true, pubkey: counter_account },
           { isSigner: false, isWritable: false, pubkey: token_mint },
           { isSigner: false, isWritable: false, pubkey: token_program },
           { isSigner: false, isWritable: false, pubkey: SYSVAR_RENT_PUBKEY },
           { isSigner: false, isWritable: false, pubkey: term_account },
           { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
           { isSigner: false, isWritable: false, pubkey: ASSOCIATED_TOKEN_PROGRAM_ID },
      ],
         data: Buffer.from(concated)
       });

       const message = new TransactionMessage({
         instructions: [ix],
         payerKey: initializer.publicKey,
         recentBlockhash: (await connection.getLatestBlockhash()).blockhash
       }).compileToV0Message();

       const tx = new VersionedTransaction(message);
       tx.sign([initializer]);

       const sig = await connection.sendTransaction(tx);

       console.log("raffle = " + raffle_account.toBase58())

       console.log(sig)
  }

  const join_raffle = async (raffle_no:bigint, participanta:Keypair) => {
  
    const participant = Keypair.generate()

    const transferix = SystemProgram.transfer({
      fromPubkey:participanta.publicKey,
      toPubkey:participant.publicKey,
      lamports:LAMPORTS_PER_SOL*5
    });

    const raffle_no_le_byte = numberToLEBytes8(raffle_no)

    const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),raffle_no_le_byte],raffle_program)[0]


    const participant_pda = PublicKey.findProgramAddressSync([
      Buffer.from("raf"),
      raffle_no_le_byte,
      Buffer.from("par"),
      participant.publicKey.toBytes()
    ],raffle_program)[0];


    console.log(participant.publicKey.toBase58())

    const ix = new TransactionInstruction({
      programId: raffle_program,
      keys: [
        { isSigner: true, isWritable: true, pubkey: participant.publicKey },
        { isSigner: false, isWritable: true, pubkey: raffle_account },
        { isSigner: false, isWritable: true, pubkey: participant_pda },
        { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
   ],
      data: Buffer.from([1])
    });

    const message = new TransactionMessage({
      instructions: [transferix,ix],
      payerKey: participanta.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash
    }).compileToV0Message();

    const tx = new VersionedTransaction(message);
    tx.sign([participanta,participant]);

    const sig = await connection.sendTransaction(tx);


  }

  const call_rng_choose_winner = async (raffle_no:bigint,authority:Keypair) => {

   
    const le_bytes = numberToLEBytes8(raffle_no)
 
    const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),le_bytes],raffle_program)[0];
 
 
   
     const ix = new TransactionInstruction({
       programId: raffle_program,
       keys: [
         { isSigner: true, isWritable: true, pubkey: authority.publicKey },
         { isSigner: false, isWritable: true, pubkey: raffle_account },
         { isSigner: false, isWritable: true, pubkey: entropy_account },
         { isSigner: false, isWritable: true, pubkey: rng_program_fee_account },
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

  const publish_winner = async (raffle_no:bigint,winner_no:bigint,authority:Keypair) => {
  
   
    const le_bytes = numberToLEBytes8(raffle_no)
 
    const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),le_bytes],raffle_program)[0];
 
 
    const raffle_account_info = await connection.getAccountInfo(raffle_account);
 
    const raffle = deserialize(RaffleSchema,Raffle,raffle_account_info?.data!);


    const participant_no_le_bytes = numberToLEBytes8(BigInt(raffle.winner_no.toString()));

    console.log(raffle.winner_no.toString())

    const winner_pda = await get_participation_account_by_raffle_noand_winner_no(BigInt(raffle_no),BigInt(winner_no))



     const ix = new TransactionInstruction({
       programId: raffle_program,
       keys: [
         { isSigner: false, isWritable: true, pubkey: raffle_account },
         { isSigner: false, isWritable: false, pubkey: winner_pda }, 
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
 
     await connection.sendTransaction(tx);
     
  }

  const claim_prize = async (authority:Keypair,winner:PublicKey, token_mint:PublicKey, number_of_raffles:bigint) => {
  
    const [token_program,_decimals] = await get_token_program_and_decimals(token_mint)

    const raffle_no_le_byte = numberToLEBytes8(number_of_raffles)

    const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),raffle_no_le_byte],raffle_program)[0]

    
    const winner_ata = getAssociatedTokenAddressSync(
      token_mint,
      winner,
      false,
      token_program,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const raffle_account_ata = getAssociatedTokenAddressSync(
      token_mint,
      raffle_account,
      true,
      token_program,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const winner_pda = PublicKey.findProgramAddressSync([
      Buffer.from("raf"),
      raffle_no_le_byte,
      Buffer.from("par"),
      winner.toBytes()
    ],raffle_program)[0];


    const ix = new TransactionInstruction({
      programId: raffle_program,
      keys: [
        { isSigner: false, isWritable: true, pubkey: raffle_account },
        { isSigner: false, isWritable: true, pubkey: raffle_account_ata },
        { isSigner: false, isWritable: false, pubkey: winner_pda },
        { isSigner: false, isWritable: false, pubkey: winner },
        { isSigner: false, isWritable: true, pubkey: winner_ata },
        { isSigner: false, isWritable: false, pubkey: token_mint },
        { isSigner: false, isWritable: false, pubkey: token_program },
        { isSigner: false, isWritable: false, pubkey: SYSVAR_RENT_PUBKEY },
        { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
   ],
      data: Buffer.from([100])
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

    console.log(sig)
  }

  const collect_fee_initializer = async (number_of_raffles:bigint, initializer:Keypair) => {


    const le_bytes = numberToLEBytes8(number_of_raffles)

    const raffle_account = PublicKey.findProgramAddressSync([Buffer.from("raffle"),le_bytes],raffle_program)[0]


    const raffle_program_fee_account = PublicKey.findProgramAddressSync([Buffer.from("term")], raffle_program)[0];

    const balance_raffle = await connection.getBalance(raffle_account);
    const balance_fee = await connection.getBalance(raffle_program_fee_account);

    const ix = new TransactionInstruction({
      programId: raffle_program,
      keys: [
        { isSigner: true, isWritable: true, pubkey: initializer.publicKey },
        { isSigner: false, isWritable: true, pubkey: raffle_account },
        { isSigner: false, isWritable: true, pubkey: raffle_program_fee_account },
   ],
      data: Buffer.from([200])
    });

    const message = new TransactionMessage({
      instructions: [ix],
      payerKey: initializer.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash
    }).compileToV0Message();

    const tx = new VersionedTransaction(message);
    tx.sign([initializer]);

    //const sig = connection.sendTransaction(tx);


    //console.log(sig)

    const balance_raffle_after = await connection.getBalance(raffle_account);
    const balance_fee_after = await connection.getBalance(raffle_program_fee_account);

    console.log(" raffle  " + balance_raffle)
    console.log(" fee  " + balance_fee)
    console.log(" raffle after " + balance_fee_after)
    console.log(" raffle after " + balance_raffle_after)
  }

  const privateKey = [  252,230,154,161,254,62,202,162,3,194,114,179,144,167,200,109,245,100,163,65,110,47,8,238,67,236,131,219,244,150,177,
    217,240,7,211,232, 133,42,12,128,21,145,118,148,224,114,6,106,81,143,203,183,205,94,185,89,28,156,216,231,49,52,210,77]

  const authority = Keypair.fromSecretKey(Uint8Array.from(privateKey))


  //init_raffle("caglars raffle", BigInt(10),2,3,authority,token_mint)
  //join_raffle(BigInt(13),authority)
  //call_rng_choose_winner(BigInt(13),authority)
  //publish_winner(BigInt(13),BigInt(0),authority);
  //claim_prize(authority,authority.publicKey,token_mint,BigInt(13))

  collect_fee_initializer(BigInt(13),authority);

  

  //update_terms(authority,1,BigInt(600))

  //init_config(authority)

  //init_counter(authority)
  //init_term_account(authority)
  //update_terms(authority,5,BigInt(600))
  
  //get_terms()

  //get_raffle_by_raffle_no(BigInt(13))  

  //get_participation_account_by_raffle_noand_winner_no(BigInt(10),BigInt(5))

   const create_ata = async () => {

    const winner = new PublicKey("61wHZ9iWcrpj94XdeWYSY2oSXtSHQEDsCf4ijCY19Tgy");
    const [token_program,_decimals] = await get_token_program_and_decimals(token_mint);

    const raffle_account_ata = getAssociatedTokenAddressSync(
      token_mint,
      winner,
      false,
      token_program,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const ix = createAssociatedTokenAccountInstruction(authority.publicKey,raffle_account_ata,winner,token_mint,token_program,ASSOCIATED_TOKEN_PROGRAM_ID)
   
    const message = new TransactionMessage({
      instructions: [ix],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash
    }).compileToV0Message();

    const tx = new VersionedTransaction(message);
    tx.sign([authority]);

    console.log(raffle_account_ata.toBase58())

    //const sig = connection.sendTransaction(tx);
  }

  //create_ata()

 //total_value = 30002185440
 //collected_value = 30000000000
 //collected_value_div_by_100 = 300000000
 //total_fee = 1500000000
 //transfer_to_initializer = 28500000000


