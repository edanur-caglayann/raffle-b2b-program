import { PublicKey } from "@solana/web3.js";
import { raffle_program } from "./accounts";
import { connection } from "./connection";
import { deserialize_raffle_account_data, numberToLEBytes8 } from "./utils";

import baseX from "base-x";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bs58 = baseX(BASE58);


export const get_all_raffles = async() => {

    const account = await connection.getProgramAccounts(
        raffle_program,
        {
          filters: [
            {
              dataSize: 121,
            },
          ],
        }
      );
      
      deserialize_raffle_account_data(account[0].account)
}

export const get_all_active_raffles = async() => {

    const one = bs58.encode([1]);


    const account = await connection.getProgramAccounts(
        raffle_program,
        {
          filters: [
            {
              dataSize: 121,
            },
            {
              memcmp: {
                encoding:"base58",
                offset: 32, 
                bytes: one,
              },
            },
    
          ],
        }
      );

      console.log(account.length)
      
}

export const get_all_finalized_raffles = async() => {

    const three = bs58.encode([3]);


    const account = await connection.getProgramAccounts(
        raffle_program,
        {
          filters: [
            {
              dataSize: 121,
            },
            {
              memcmp: {
                offset: 32, 
                bytes: three,
              },
            },
    
          ],
        }
      );
      
}

export const get_all_finalized_raffles_with_unpublished_winners = async() => {

    const two = bs58.encode([2]);


    const account = await connection.getProgramAccounts(
        raffle_program,
        {
          filters: [
            {
              dataSize: 121,
            },
            {
              memcmp: {
                offset: 32, 
                bytes: two,
              },
            },
    
          ],
        }
      );
      
}

export const get_raffle_by_raffle_no = async(raffle_no:bigint) => {

    const le_bytes = numberToLEBytes8(raffle_no)

    console.log(le_bytes)

    const no = bs58.encode(le_bytes);

    console.log(no)


    const account = await connection.getProgramAccounts(
        raffle_program,
        {
          filters: [
            {
              dataSize: 121,
            },
            {
              memcmp: {
                offset: 33, 
                bytes: no,
              },
            },
    
          ],
        }
      );

      console.log(account.length)
      
}

export const get_all_raffles_organized_by_this_address = async(initializer:PublicKey) => {

    const account = await connection.getProgramAccounts(
        raffle_program,
        {
          filters: [
            {
              dataSize: 121,
            },
            {
              memcmp: {
                offset: 0, 
                bytes: initializer.toString(),
              },
            },
    
          ],
        }
      );
      
}

export const get_all_active_raffles_organized_by_this_address = async(initializer:PublicKey) => {

    const one = bs58.encode([1]);


    const account = await connection.getProgramAccounts(
        raffle_program,
        {
          filters: [
            {
              dataSize: 121,
            },
            {
              memcmp: {
                offset: 0, 
                bytes: initializer.toString(),
              },
            },
            {
              memcmp: {
                offset: 32, 
                bytes: one,
              },
            },
    
          ],
        }
      );
      
}

export const get_all_finalized_raffles_organized_by_this_address = async(initializer:PublicKey) => {

    const three = bs58.encode([3]);


    const account = await connection.getProgramAccounts(
        raffle_program,
        {
          filters: [
            {
              dataSize: 121,
            },
            {
              memcmp: {
                offset: 0, 
                bytes: initializer.toString(),
              },
            },
            {
              memcmp: {
                offset: 32, 
                bytes: three,
              },
            },
    
          ],
        }
      );
      
}

export const get_all_finalized_raffles_organized_with_unpublished_winners_by_this_address = async(initializer:PublicKey) => {

    const two = bs58.encode([2]);


    const account = await connection.getProgramAccounts(
        raffle_program,
        {
          filters: [
            {
              dataSize: 121,
            },
            {
              memcmp: {
                offset: 0, 
                bytes: initializer.toString(),
              },
            },
            {
              memcmp: {
                offset: 32, 
                bytes: two,
              },
            },
    
          ],
        }
      );
      
}

export const get_all_participation_accounts_by_this_address = async(initializer:PublicKey) => {

    const account = await connection.getProgramAccounts(
        raffle_program,
        {
          filters: [
            {
              dataSize: 48,
            },
            {
              memcmp: {
                offset: 0, 
                bytes: initializer.toString(),
              },
            },
    
          ],
        }
      );

}

export const get_all_participation_accounts_by_raffle_no = async(raffle_no:bigint) => {

    const le_bytes = numberToLEBytes8(raffle_no)

    const no = bs58.encode(le_bytes);

    const account = await connection.getProgramAccounts(
        raffle_program,
        {
          filters: [
            {
              dataSize: 48,
            },
            {
              memcmp: {
                offset: 32, 
                bytes: no,
              },
            },
    
          ],
        }
      );

}

export const get_raffle_counter = async() => {

    const counter_account = PublicKey.findProgramAddressSync([Buffer.from("counter")],raffle_program)[0]

    const account = await connection.getAccountInfo(counter_account)
    
}

