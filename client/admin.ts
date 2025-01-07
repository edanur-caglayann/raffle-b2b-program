import {
    Keypair,
    PublicKey,
    TransactionMessage,
    VersionedTransaction,
    SystemProgram,
    TransactionInstruction,
    LAMPORTS_PER_SOL,

  } from "@solana/web3.js";

  import { serialize } from "borsh";
  import { Terms, TermsSchema, InitPda, InitPdaSchema } from "./models";
  import { connection} from './connection';
  import { raffle_program, } from "./accounts"



  export const set_config = async (authority:Keypair) => {
  
    const config_account = PublicKey.findProgramAddressSync([Buffer.from("config")],raffle_program)[0];

  
    const ix = new TransactionInstruction({
      programId: raffle_program,
      keys: [
        { isSigner: true, isWritable: true, pubkey: authority.publicKey },
        { isSigner: false, isWritable: false, pubkey: authority.publicKey },//1
        { isSigner: false, isWritable: false, pubkey: authority.publicKey },//2
        { isSigner: false, isWritable: false, pubkey: authority.publicKey },//3
        { isSigner: false, isWritable: false, pubkey: authority.publicKey },//4
        { isSigner: false, isWritable: true, pubkey: config_account },
      ],
      data: Buffer.from([8])
    });
  

    const message = new TransactionMessage({
      instructions: [ix],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash
    }).compileToV0Message();
  
    const tx = new VersionedTransaction(message);
    tx.sign([authority]);
  
    const sig = await connection.sendTransaction(tx);

    console.log(sig)
  
  }

  export const collect_fee = async (authority:Keypair) => {
  
    const fee_account = PublicKey.findProgramAddressSync([Buffer.from("fee")], raffle_program)[0];
  
    const config_account = PublicKey.findProgramAddressSync([Buffer.from("config")],raffle_program)[0];

    const ix = new TransactionInstruction({
      programId: raffle_program,
      keys: [
        { isSigner: true, isWritable: true, pubkey: authority.publicKey },
        { isSigner: false, isWritable: true, pubkey: fee_account },
        { isSigner: false, isWritable: false, pubkey: config_account },
      ],
      data: Buffer.from([7])
    });
  
    const message = new TransactionMessage({
      instructions: [ix],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash
    }).compileToV0Message();
  
    const tx = new VersionedTransaction(message);
    tx.sign([authority]);
  
    const sig = await connection.sendTransaction(tx);
  
  }

  export const update_terms = async (authority:Keypair, new_fee:number, expiration_time:bigint) => {

    const term = new Terms()

    term.fee = BigInt(new_fee);
    term.expiration_time = expiration_time;
    term.init = 2;

    let encoded = serialize(TermsSchema, term);
  
    const config_account = PublicKey.findProgramAddressSync([Buffer.from("config")],raffle_program)[0]

  
    let concated = Uint8Array.of(9, ...encoded);
  
    const term_account = PublicKey.findProgramAddressSync([Buffer.from("term")], raffle_program)[0];
  
    const ix = new TransactionInstruction({
      programId: raffle_program,
      keys: [
        { isSigner: true, isWritable: true, pubkey: authority.publicKey },
        { isSigner: false, isWritable: true, pubkey: term_account },
        { isSigner: false, isWritable: false, pubkey: config_account },
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
  
    await connection.sendTransaction(tx);
  
  }

  export const init_config = async (authority:Keypair) => {


    const config_account = PublicKey.findProgramAddressSync([Buffer.from("config")],raffle_program)
    console.log(config_account.toString())
  
    const ix = new TransactionInstruction({
      programId: raffle_program,
      keys: [
        { isSigner: true, isWritable: true, pubkey: authority.publicKey },
        { isSigner: false, isWritable: false, pubkey: authority.publicKey  },
        { isSigner: false, isWritable: false, pubkey: authority.publicKey  },
        { isSigner: false, isWritable: false, pubkey: authority.publicKey  },
        { isSigner: false, isWritable: true, pubkey: config_account[0] },
        { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
      ],
      data: Buffer.from([7])
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

  export const init_term_account = async (authority:Keypair) => {


    const term_account = PublicKey.findProgramAddressSync([Buffer.from("term")], raffle_program)[0];

    console.log("term account = " + term_account);

    const data = new InitPda();

    data.lamports = 0.0027*LAMPORTS_PER_SOL;

    console.log(data.bump);

    const encoded = serialize(InitPdaSchema, data);

    let concated = Uint8Array.of(6, ...encoded);

    const config_account = PublicKey.findProgramAddressSync([Buffer.from("config")],raffle_program)[0]


    const ix = new TransactionInstruction({
      programId: raffle_program,
      keys: [
        { isSigner: true, isWritable: true, pubkey: authority.publicKey },
        { isSigner: false, isWritable: true, pubkey: term_account },
        { isSigner: false, isWritable: false, pubkey: config_account },
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

    await connection.sendTransaction(tx);

  }

  export const close_account = async (authority:Keypair) => {
  
    const counter_account = PublicKey.findProgramAddressSync([Buffer.from("counter")],raffle_program)[0]
  

    const ix = new TransactionInstruction({
      programId: raffle_program,
      keys: [
        { isSigner: true, isWritable: true, pubkey: authority.publicKey },
        { isSigner: false, isWritable: true, pubkey: counter_account },
      ],
      data: Buffer.from([5])
    })

  console.log(counter_account.toBase58())

    const message = new TransactionMessage({
      instructions: [ix],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash
    }).compileToV0Message();
  
    const tx = new VersionedTransaction(message);
    tx.sign([authority]);
  
    const sig = await connection.sendTransaction(tx);
  
  }

  export const init_counter = async (authority:Keypair) => {
  
  

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


