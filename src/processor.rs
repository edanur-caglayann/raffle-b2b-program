use crate::{instruction::RaffleProgramInstruction, state::{NumberOfParticipants, Participant, Raffle, RaffleCounter, RandomNumber}};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint::ProgramResult, instruction::{AccountMeta, Instruction}, msg, program::{get_return_data, invoke, invoke_signed}, pubkey::Pubkey, rent::Rent, system_instruction
};
use crate::error::RaffleProgramError::{InvalidCounter, ArithmeticError, InvalidInitializer, InvalidRaffle,
     InitializerNotSigner, InvalidWinnerPDA,InvaliedWinnerNo,InvaliedRaffleNo, InvalidParticipantPDA};

pub struct Processor;
impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction: RaffleProgramInstruction = RaffleProgramInstruction::unpack(instruction_data)?;

        match instruction {
            RaffleProgramInstruction::InitRaffle {init_raffle}=> {
                Self::init_raffle(accounts, program_id, init_raffle)
            },
            RaffleProgramInstruction::AddWallets { number_of_participants }=> {
                Self::add_wallets_raffle(accounts, program_id, number_of_participants)
            },
            RaffleProgramInstruction::ChooseWinner => {
                Self::choose_winner(accounts, program_id)
            },
            RaffleProgramInstruction::PublishWinner => {
                Self::publish_winner(accounts, program_id)
            },
            RaffleProgramInstruction::InitCounter => {
                Self::init_raffle_counter(accounts, program_id)
            },
            RaffleProgramInstruction::ClosePDA => {
                Self::close_participant_pda(accounts, program_id)
            },

        }
    }

    fn init_raffle(accounts: &[AccountInfo],program_id: &Pubkey, init_raffle:Raffle) -> ProgramResult{


       let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

       let initializer: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       let raffle_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       let raffle_counter: &AccountInfo<'_> = next_account_info(accounts_iter)?;

       let mut counter = RaffleCounter::try_from_slice(&raffle_counter.data.borrow())?;

       if raffle_counter.owner != program_id{return Err(InvalidCounter.into());}
       if counter.initialized != 1 {return Err(InvalidCounter.into());}
       if !initializer.is_signer{return Err(InitializerNotSigner.into())}

       counter.number_of_raffles = counter.number_of_raffles.checked_add(1).ok_or(ArithmeticError)?;

       let (raffle_account_address, bump) = 
       Pubkey::find_program_address(&[b"raffle", &counter.number_of_raffles.to_le_bytes()], program_id);

        let rent: Rent = Rent::default();
        let rent_amount: u64 = rent.minimum_balance(121);

        invoke_signed(
            &system_instruction::create_account(
                initializer.key,
                &raffle_account_address,
                rent_amount,
                121,
                program_id,
            ),
            &[initializer.clone(), raffle_account.clone()],
            &[&[b"raffle", &counter.number_of_raffles.to_le_bytes(), &[bump]]],
        )?;

        let mut raffle_name_array:[u8;32] = [0;32];
        init_raffle.raffle_name.serialize(&mut &mut raffle_name_array[..]).unwrap();
        

        let raffle = Raffle{
            initializer: initializer.key.to_bytes(),
            raffle_state: 1,
            number_of_participants: init_raffle.number_of_participants,
            winner_no: 0,
            winner_wallet: [0;32],
            raffle_name: raffle_name_array,
            raffle_no: counter.number_of_raffles
        };

        raffle.serialize(&mut &mut raffle_account.data.borrow_mut()[..])?;
        counter.serialize(&mut &mut raffle_counter.data.borrow_mut()[..])?;

        Ok(())
    }

    fn add_wallets_raffle(accounts: &[AccountInfo],program_id: &Pubkey, mut number_of_participants:NumberOfParticipants) -> ProgramResult{

        let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();


        let initializer: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let raffle_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let system_program: &AccountInfo<'_> = next_account_info(accounts_iter)?;


        let raffle: Raffle = Raffle::try_from_slice(&raffle_account.data.borrow())?;
    
        if raffle_account.owner != program_id {return Err(InvalidRaffle.into());}
        if raffle.initializer != initializer.key.to_bytes(){return Err(InvalidInitializer.into());}
        if !initializer.is_signer{return Err(InitializerNotSigner.into())}
    
        let rent: Rent = Rent::default();
        let rent_amount: u64 = rent.minimum_balance(48);

        let total_loop = accounts_iter.len() as u64 / 2;
    
        for _x in 0..total_loop {

            msg!("{}",accounts_iter.len());

            let user: &AccountInfo<'_> = next_account_info(accounts_iter)?;
            let user_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        
            number_of_participants.number_of_participants = number_of_participants.number_of_participants.checked_add(1).ok_or(ArithmeticError)?;
        
            let (participant_account_address, bump) = 
            Pubkey::find_program_address(&[b"part", &raffle.number_of_participants.to_le_bytes(),b"raf",&raffle.raffle_no.to_le_bytes()], program_id);
    
    
             invoke_signed(
                 &system_instruction::create_account(
                     initializer.key,
                     &participant_account_address,
                     rent_amount,
                     48,
                     program_id,
                 ),
                 &[initializer.clone(), user_pda.clone(),system_program.clone() ],
                 &[&[b"part", &raffle.number_of_participants.to_le_bytes(),b"raf",&raffle.raffle_no.to_le_bytes(), &[bump]]],
             )?;

             let participant: Participant = Participant{ 
                particpant_address: user.key.to_bytes(),
                particpant_no: raffle.number_of_participants,
                raffle_no: raffle.raffle_no };


            participant.serialize(&mut &mut user_pda.data.borrow_mut()[..])?;


        }


        Ok(())
    }

    fn choose_winner(accounts: &[AccountInfo],program_id: &Pubkey) -> ProgramResult{

        let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();


        let initializer: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let raffle_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let entropy_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let fee_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let rng_program: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let system_program: &AccountInfo<'_> = next_account_info(accounts_iter)?;


        let mut raffle = Raffle::try_from_slice(&raffle_account.data.borrow())?;
    
        if raffle_account.owner != program_id {return Err(InvalidRaffle.into());}
        if raffle.initializer != initializer.key.to_bytes(){return Err(InvalidInitializer.into());}
        if !initializer.is_signer{return Err(InitializerNotSigner.into())}


        //Creating account metas for CPI to RNG_PROGRAM
        let initializer_meta = AccountMeta{ pubkey: *initializer.key, is_signer: true, is_writable: true,};
        let entropy_account_meta = AccountMeta{ pubkey: *entropy_account.key, is_signer: false, is_writable: true,};
        let fee_account_meta = AccountMeta{ pubkey: *fee_account.key, is_signer: false, is_writable: true,};
        let system_program_meta = AccountMeta{ pubkey: *system_program.key, is_signer: false, is_writable: false,};
       
    
    
        //Creating instruction to cpi RNG PROGRAM
        let ix:Instruction = Instruction { program_id: *rng_program.key,
           accounts: [
            initializer_meta,
            entropy_account_meta,
            fee_account_meta,
            system_program_meta,
           ].to_vec(), data: [100].to_vec() };
    
        //CPI to RNG_PROGRAM
        invoke(&ix, 
          &[
            initializer.clone(),
            entropy_account.clone(),
            fee_account.clone(),
            system_program.clone(),
            ])?;
    
    
        let returned_data:(Pubkey, Vec<u8>)= get_return_data().unwrap();


        //Random number is returned from the RNG_PROGRAM
        let random_number:RandomNumber;
        if &returned_data.0 == rng_program.key{
          random_number = RandomNumber::try_from_slice(&returned_data.1)?;
          msg!("{}",random_number.random_number);
        }else{
            panic!();
        }
    
        let winner_no: u64 = random_number.random_number%raffle.number_of_participants;
    
        if winner_no == 0 {
            raffle.winner_no = raffle.number_of_participants;
        }else{
            raffle.winner_no = winner_no;
        }

        raffle.raffle_state = 2;
    
        raffle.serialize(&mut &mut raffle_account.data.borrow_mut()[..])?;
    
    
        Ok(())
    }

    fn publish_winner(accounts: &[AccountInfo],program_id: &Pubkey) -> ProgramResult{

        let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

        let initializer: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let raffle_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let winner_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let winner: &AccountInfo<'_> = next_account_info(accounts_iter)?;


        let mut raffle = Raffle::try_from_slice(&raffle_account.data.borrow())?;
        let participant = Participant::try_from_slice(&winner_pda.data.borrow())?;
    
        if raffle_account.owner != program_id {return Err(InvalidRaffle.into());}
        if winner_pda.owner != program_id {return Err(InvalidWinnerPDA.into());}

        if raffle.initializer != initializer.key.to_bytes(){return Err(InvalidInitializer.into());}
        if !initializer.is_signer{return Err(InitializerNotSigner.into())}
        
        if raffle.winner_no != participant.particpant_no{return Err(InvaliedWinnerNo.into());}
        if raffle.raffle_no != participant.raffle_no{return Err(InvaliedRaffleNo.into());}


       let (winner_pda_address, _bump) = 
       Pubkey::find_program_address(&[b"part", &raffle.winner_no.to_le_bytes(),b"raf",&raffle.raffle_no.to_le_bytes()], program_id);

        if &winner_pda_address != winner_pda.key {return Err(InvalidWinnerPDA.into());}

        raffle.raffle_state = 3;
        raffle.winner_wallet = winner.key.to_bytes();

        raffle.serialize(&mut &mut raffle_account.data.borrow_mut()[..])?;
        
        Ok(())
    }

    fn init_raffle_counter(accounts: &[AccountInfo],program_id: &Pubkey) -> ProgramResult{


        let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

        let initializer: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let counter_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;


        let rent: Rent = Rent::default();
        let rent_amount: u64 = rent.minimum_balance(9);


       let (counter_account_address, bump) = 
       Pubkey::find_program_address(&[b"counter" ], program_id);

        invoke_signed(
            &system_instruction::create_account(
                initializer.key,
                &counter_account_address,
                rent_amount,
                9,
                program_id,
            ),
            &[initializer.clone(), counter_account.clone()],
            &[&[b"counter", &[bump]]],
        )?;

        let counter = RaffleCounter{ 
            initialized: 1, 
            number_of_raffles: 0
         };

         counter.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;
        

        Ok(())
    }

    fn close_participant_pda(accounts: &[AccountInfo],program_id: &Pubkey) -> ProgramResult {


        let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

        let initializer: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let raffle_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let participant_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;


        let raffle = Raffle::try_from_slice(&raffle_account.data.borrow())?;
        let participant = Participant::try_from_slice(&participant_pda.data.borrow())?;
    
        if raffle_account.owner != program_id {return Err(InvalidRaffle.into());}
        if participant_pda.owner != program_id {return Err(InvalidParticipantPDA.into());}
        if raffle.initializer != initializer.key.to_bytes(){return Err(InvalidInitializer.into());}
        if !initializer.is_signer{return Err(InitializerNotSigner.into())}
        if raffle.raffle_no != participant.raffle_no{return Err(InvaliedRaffleNo.into());}

        let value = **participant_pda.try_borrow_lamports()?;

        **participant_pda.try_borrow_mut_lamports()? -= value;
        **initializer.try_borrow_mut_lamports()? += value;
        
        Ok(())
    }

}


//ceklis kayit acik - 1
//cekilis yapildi  - 2
//kazanan yayinlandi - 3

