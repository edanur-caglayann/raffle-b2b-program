use crate::{instruction::RaffleProgramInstruction, state::{ Config, Term, InitPda, InitRaffle, Participant, Raffle, RaffleCounter, RandomNumber}};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},  entrypoint::ProgramResult,
     instruction::{AccountMeta, Instruction}, msg, program::{get_return_data, invoke, invoke_signed},
      pubkey::Pubkey, rent::Rent, system_instruction,   sysvar::{clock::Clock, Sysvar,},

};
use solana_program::program_pack::Pack;
use spl_token::state::Account;


use crate::error::RaffleProgramError::{InvalidCounter, ArithmeticError, InvalidInitializer, InvalidNumberOfParticipants,
     ParticipantNotSigner, MaxNumberReached, InvalidWinner, InvalidFee,  InvalidRaffleState,
     InitializerNotSigner, InvalidWinnerPDA,InvalidWinnerNo,InvalidRaffleNo, InvalidParticipantPDA,
    InvalidConfig, NotSignerAuth,  InvalidAuth,  InvalidRaffle, InvalidTerms, InvalidRaffleTime
    };

use spl_associated_token_account::instruction::create_associated_token_account;


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
            RaffleProgramInstruction::JoinRaffle => {
                Self::join_raffle(accounts,program_id)
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
            RaffleProgramInstruction::InitTerm {data}=> {
                Self::init_term_account(accounts, program_id, data)
            },
            RaffleProgramInstruction::InitConfig => {
                Self::init_config(accounts, program_id)
            },
            RaffleProgramInstruction::SetConfig => {
                Self::set_config(accounts, program_id)
            },
            RaffleProgramInstruction::UpdateTerm {data}=> {
                Self::update_terms(accounts, program_id, data)
            },
            RaffleProgramInstruction::CollectFee => {
                Self::collect_fee(accounts, program_id)
            },
            RaffleProgramInstruction::ClaimPrize => {
                Self::claim_prize(accounts, program_id)
            },
            RaffleProgramInstruction::CollectFeeInitializer => {
                Self::collect_fee_initializer(accounts, program_id)
            },

        }
    }

    // cekilis baslat
    fn init_raffle(
        accounts: &[AccountInfo],program_id: &Pubkey, init_raffle:InitRaffle
    ) -> ProgramResult{


       let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

       let initializer: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       let initializer_ata: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       let raffle_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       let raffle_account_ata: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       let counter_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       let token_mint: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       let token_program_id: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       let sysvar: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       let term_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       let participant_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
       msg!("11");

       let mut counter: RaffleCounter = RaffleCounter::try_from_slice(&counter_account.data.borrow())?;
        msg!("10");
        let terms: Term = Term::try_from_slice(&term_account.data.borrow())?;
        msg!("9");
        if counter.initialized != 1 {return Err(InvalidCounter.into());}

        msg!("8");
        if terms.initialized != 2 {return Err(InvalidTerms.into());}

        msg!("8");
        if counter_account.owner != program_id{return Err(InvalidCounter.into());}
       if term_account.owner != program_id{return Err(InvalidTerms.into());}

        msg!("7");
        if !initializer.is_signer{return Err(InitializerNotSigner.into())}

       counter.number_of_raffles = counter.number_of_raffles.checked_add(1).ok_or(ArithmeticError)?;

       let (raffle_account_address, bump) = 
       Pubkey::find_program_address(&[b"raffle", &counter.number_of_raffles.to_le_bytes()], program_id);
       msg!("6");

        let rent: Rent = Rent::default();
        let rent_amount: u64 = rent.minimum_balance(187);
        msg!("5");

        //raffle account created
        invoke_signed(
            &system_instruction::create_account(
                initializer.key,
                &raffle_account_address,
                rent_amount,
                187,
                program_id,
            ),
            &[initializer.clone(), raffle_account.clone()],
            &[&[b"raffle", &counter.number_of_raffles.to_le_bytes(), &[bump]]],
        )?;
        msg!("4");

        //raffle ata create ix
        let create_dex_ata: solana_program::instruction::Instruction = create_associated_token_account(
            initializer.key, // ATA sahibinin cuzdani. bir ATA oluşturulurken işlem ücretlerini ödeyen ve hesabı finanse eden adrestir.
            raffle_account.key, // Tokenlerin tutuldugu hesap
            token_mint.key, // ATA, hangi SPL token turu icin olusturuluyor. mint adresi tokenin benzersiz kimligidir
            token_program_id.key); //kullanilan SPL Token programi

            // olusturdugumuz instructionu(talimati) belirli hesaplar uzerindecalistirir
        invoke(&create_dex_ata,
              &[initializer.clone(), // ATA'yi olusturan kullanici
              raffle_account_ata.clone(), 
              raffle_account.clone(),
              token_mint.clone(),
              token_program_id.clone(),
              sysvar.clone()])?;
              msg!("3");

              // Kullanicidan baska hesaba belirli bir mik. token transferi
        let transfer_token_ix = spl_token::instruction::transfer_checked(
            &token_program_id.key, // token islemleri icin kullanilan SPL token progaminin adresi
            &initializer_ata.key, 
            &token_mint.key, 
            &raffle_account_ata.key,  // tokenlerin gonderilecegi hedef ATA adresi
            &initializer.key, 
            &[],init_raffle.prize_amount,init_raffle.decimals)?;

        invoke(
        &transfer_token_ix, 
        &[token_program_id.clone(),raffle_account_ata.clone(),token_mint.clone(),initializer_ata.clone(),initializer.clone()],
        )?;

        msg!("2");


        let clock: Clock= Clock::get()?;
        let current_time: u64 = clock.unix_timestamp as u64;
        let maximum_time_allowed: u64  = current_time.checked_add(terms.expiration_time).ok_or(ArithmeticError)?;
        if init_raffle.raffle_time < current_time{return Err(InvalidRaffleTime.into());}
        if init_raffle.raffle_time > maximum_time_allowed{return Err(InvalidRaffleTime.into());}

        let raffle_time:u64;
        let participants_required:u64;
        if init_raffle.is_unlimited_participant_allowed  == 1{
            raffle_time = init_raffle.raffle_time;
            participants_required = 0;

        }else{
            raffle_time = current_time.checked_add(terms.expiration_time).ok_or(ArithmeticError)?;
            if init_raffle.participants_required < terms.min_number_of_participants {return Err(InvalidNumberOfParticipants.into());}
            participants_required = init_raffle.participants_required;
            
        }


        let data: Raffle = Raffle{
            raffle_state: 1,
            decimals: init_raffle.decimals,
            initializer: initializer.key.to_bytes(),
            token_mint: token_mint.key.to_bytes(),
            winner_address: [0;32],
            raffle_name: init_raffle.raffle_name,
            raffle_no: counter.number_of_raffles,
            current_number_of_participants: 1,
            participants_required,
            winner_no: 0,
            participation_fee: init_raffle.participation_fee,
            prize_amount: init_raffle.prize_amount,
            raffle_time,
            is_unlimited_participant_allowed: init_raffle.is_unlimited_participant_allowed,
        };

        msg!("1");

       // stringler + cekilis no + ATA olsuturan hesap
        let (participant_pda_address, bump) = 
        Pubkey::find_program_address(
            &[
            b"raf", 
            &counter.number_of_raffles.to_le_bytes(), 
            b"par",
            &initializer.key.to_bytes()
            ], program_id);
 

         let rent_amount: u64 = rent.minimum_balance(48);
 
         //raffle account created
         invoke_signed(
             &system_instruction::create_account(
                initializer.key,
                 &participant_pda_address,
                 rent_amount,
                 48,
                 program_id,
             ),
             &[initializer.clone(), participant_pda.clone()],
             &[
            &[            
             b"raf", 
             &counter.number_of_raffles.to_le_bytes(), 
             b"par",
             &initializer.key.to_bytes(), &[bump]]
             ],
         )?;

         if init_raffle.participation_fee != 0 {
            invoke(&system_instruction::transfer(
                initializer.key,
                raffle_account.key, 
                init_raffle.participation_fee), 
                &[initializer.clone(),raffle_account.clone()])?;
         }


        let participant: Participant = Participant{
            particpant_address: initializer.key.to_bytes(),
            particpant_no: 0,
            raffle_no: counter.number_of_raffles,
        };


        participant.serialize(&mut &mut participant_pda.data.borrow_mut()[..])?;
        data.serialize(&mut &mut raffle_account.data.borrow_mut()[..])?;
        counter.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;

        Ok(())
    }

    // cekilise katil
    fn join_raffle(
        accounts: &[AccountInfo],program_id: &Pubkey,
    ) -> ProgramResult{


        let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();
 
        let participant_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let raffle_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let participant_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;

        if raffle_account.owner != program_id {return Err(InvalidRaffle.into());}
        if !participant_account.is_signer {return Err(ParticipantNotSigner.into());}

        let mut raffle: Raffle = Raffle::try_from_slice(&raffle_account.data.borrow())?;


        if raffle.raffle_state != 1 {return Err(InvalidRaffleState.into());}

        if raffle.is_unlimited_participant_allowed != 1{
            if raffle.participants_required <= raffle.current_number_of_participants {return Err(MaxNumberReached.into());}
        }

        let (participant_pda_address, bump) = 
        Pubkey::find_program_address(
            &[
            b"raf", 
            &raffle.raffle_no.to_le_bytes(), 
            b"par",
            &participant_account.key.to_bytes()
            ], program_id);
 
         let rent: Rent = Rent::default();
         let rent_amount: u64 = rent.minimum_balance(48);
 
         //raffle account created
         invoke_signed(
             &system_instruction::create_account(
                participant_account.key,
                 &participant_pda_address,
                 rent_amount,
                 48,
                 program_id,
             ),
             &[participant_account.clone(), participant_pda.clone()],
             &[
            &[            
             b"raf", 
             &raffle.raffle_no.to_le_bytes(), 
             b"par",
             &participant_account.key.to_bytes(), &[bump]]
             ],
         )?;

         if raffle.participation_fee != 0 {
            invoke(&system_instruction::transfer(
                participant_account.key,
                raffle_account.key, 
                raffle.participation_fee), 
                &[participant_account.clone(),raffle_account.clone()])?;
         }


        let participant: Participant = Participant{
            particpant_address: participant_account.key.to_bytes(),
            particpant_no: raffle.current_number_of_participants,
            raffle_no: raffle.raffle_no,
        };

        raffle.current_number_of_participants = raffle.current_number_of_participants.checked_add(1).ok_or(ArithmeticError)?;

        raffle.serialize(&mut &mut raffle_account.data.borrow_mut()[..])?;
        participant.serialize(&mut &mut participant_pda.data.borrow_mut()[..])?;


 
         Ok(())
     }

     // kazanani sec
    fn choose_winner(
        accounts: &[AccountInfo],program_id: &Pubkey
    ) -> ProgramResult{

        let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();


        let authority: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let raffle_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let entropy_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let fee_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let rng_program: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let system_program: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let config: &AccountInfo<'_> = next_account_info(accounts_iter)?;


        let mut raffle: Raffle = Raffle::try_from_slice(&raffle_account.data.borrow())?;
        let  config: Config = Config::try_from_slice(&config.data.borrow())?;

        if raffle_account.owner != program_id {return Err(InvalidRaffle.into());}
        if !authority.is_signer {return Err(NotSignerAuth.into());}

        Self::check_authority(authority.key, config)?;


        let clock: Clock= Clock::get()?;
        let current_time: u64 = clock.unix_timestamp as u64;

        msg!("1");
        if raffle.raffle_state != 1{return Err(InvalidRaffleState.into());}

        if raffle.is_unlimited_participant_allowed == 1 {
           if raffle.raffle_time < current_time {return Err(InvalidRaffleState.into());}
        }else{
           if raffle.current_number_of_participants != raffle.participants_required && raffle.raffle_time < current_time {return Err(InvalidRaffleState.into());}
        }

        // Baska bir program cagirarak rastgele sayi uretir. Bu sayiyi cekiliste kullanir 

        //Creating account metas for CPI to RNG_PROGRAM
        let initializer_meta: AccountMeta = AccountMeta{ // instruction'un ihtiyaci olan hesaplarin bilgilerini icerir
            pubkey: *authority.key, // islemi baslatan otoritenin hesabi
            is_signer: true, 
            is_writable: true,};

        let entropy_account_meta: AccountMeta = AccountMeta{  // rastgele sayi uretirke kullanilan entropidir(entropy)
            pubkey: *entropy_account.key, 
            is_signer: false, 
            is_writable: true,};

        let fee_account_meta: AccountMeta = AccountMeta{ // islem icin gereken ucretler
            pubkey: *fee_account.key, 
            is_signer: false, 
            is_writable: true,};

        let system_program_meta: AccountMeta = AccountMeta{  // solana'nin sistem programidir. sadece okumak icindir
            pubkey: *system_program.key, 
            is_signer: false, 
            is_writable: false,
        };

        //Creating instruction to cpi RNG PROGRAM
        let ix:Instruction = Instruction {    // rng programa cagri yapmak icin cagri olusturur
            program_id: *rng_program.key,  // calistirilan programin adresi
           accounts: [ // islem sirasinda kullanilcak hesaplar
            initializer_meta,
            entropy_account_meta,
            fee_account_meta,
            system_program_meta,
           ].to_vec(), data: [100].to_vec() };

        //CPI to RNG_PROGRAM
        invoke(&ix, 
          &[
            authority.clone(), // islemi baslatan kisi (otorite)
            entropy_account.clone(), // rastgele sayi uretimi icin kullanilan entropi
            fee_account.clone(), // ucret tahsilati icin kullanilan hesap
            system_program.clone(),
            ])?;

            // cagirilan programin dondurdugu sonuclari alir
        let returned_data:(Pubkey, Vec<u8>)= get_return_data().unwrap();

        //Random number is returned from the RNG_PROGRAM
        let random_number:RandomNumber;
        if &returned_data.0 == rng_program.key{
          random_number = RandomNumber::try_from_slice(&returned_data.1)?;
          msg!("{}",random_number.random_number);
        }else{
            panic!();
        }

        //kazanan numarasi = rastgeel sayi % toplam katilimci say
        let winner_no: u64 = random_number.random_number%raffle.current_number_of_participants;

        raffle.raffle_state = 2; // cekilis tammalandi durum = 2
        raffle.winner_no = winner_no; // cekilise kazanan num eklenir

        raffle.serialize(&mut &mut raffle_account.data.borrow_mut()[..])?;


        Ok(())
    }

    // kazanani paylas
    fn publish_winner(
        accounts: &[AccountInfo],program_id: &Pubkey
    ) -> ProgramResult{

        let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

        let raffle_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let winner_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;


        let mut raffle: Raffle = Raffle::try_from_slice(&raffle_account.data.borrow())?;
        let participant: Participant = Participant::try_from_slice(&winner_pda.data.borrow())?;

    
        if raffle_account.owner != program_id {return Err(InvalidRaffle.into());}
        if winner_pda.owner != program_id {return Err(InvalidWinnerPDA.into());}
        
        if raffle.winner_no != participant.particpant_no{return Err(InvalidWinnerNo.into());}
        if raffle.raffle_no != participant.raffle_no{return Err(InvalidRaffleNo.into());}

        if raffle.raffle_state != 2{return Err(InvalidRaffleState.into());}



        raffle.raffle_state = 3;
        raffle.winner_address = participant.particpant_address;

        raffle.serialize(&mut &mut raffle_account.data.borrow_mut()[..])?;
        
        Ok(())
    }

    // odul
    fn claim_prize(
        accounts: &[AccountInfo],program_id: &Pubkey
    ) -> ProgramResult{

        let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

        let raffle_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let raffle_account_ata: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let winner_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let winner_address: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let winner_ata: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let token_mint: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let token_program_id: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let sysvar: &AccountInfo<'_> = next_account_info(accounts_iter)?;


        let mut raffle: Raffle = Raffle::try_from_slice(&raffle_account.data.borrow())?;
        let participant: Participant = Participant::try_from_slice(&winner_pda.data.borrow())?;


        if raffle_account.owner != program_id {return Err(InvalidRaffle.into());}
        if winner_pda.owner != program_id {return Err(InvalidWinnerPDA.into());}

        if raffle.winner_no != participant.particpant_no{return Err(InvalidWinnerNo.into());}
        if raffle.raffle_no != participant.raffle_no{return Err(InvalidRaffleNo.into());}
        if winner_address.key.to_bytes() != participant.particpant_address {return Err(InvalidWinner.into());}
        if token_mint.key.to_bytes() != raffle.token_mint {return Err(InvalidWinner.into());}

        if raffle.raffle_state != 3{return Err(InvalidRaffleState.into());}

        // kazanan kullanicinin  ATA'sinin sahibini kontrol ederiz.
        // Eger sahibi bu iki id'den biri degilse bu hesap SPL token hesabi degildir
        if winner_ata.owner!=&spl_token::id() && winner_ata.owner!=&spl_token_2022::id(){

            let create_winner_ata: solana_program::instruction::Instruction = create_associated_token_account(
                winner_address.key,
                winner_address.key, 
              token_mint.key, 
              token_program_id.key);
        
            invoke(&create_winner_ata,
                &[winner_address.clone(),winner_ata.clone(),token_mint.clone(),token_program_id.clone(),sysvar.clone()])?;
        
          }else{
            let ata_unpacked: Account  = Account::unpack_from_slice(&winner_ata.data.borrow())?;

            // mint adresi & sahibi dogru mu
            if token_mint.key != &ata_unpacked.mint {panic!()}
            if winner_address.key != &ata_unpacked.owner {panic!()}
          }


       let (raffle_account_address, bump) = 
       Pubkey::find_program_address(&[b"raffle", &raffle.raffle_no.to_le_bytes()], program_id);

        let transfer_token_ix = spl_token::instruction::transfer_checked(
            &token_program_id.key,
            &raffle_account_ata.key, 
            &token_mint.key, 
            &winner_ata.key, 
            &raffle_account_address, 
            &[],raffle.prize_amount,raffle.decimals)?;

        invoke_signed(
        &transfer_token_ix, 
        &[
            token_program_id.clone(),
            raffle_account_ata.clone(),
            token_mint.clone(),
            winner_ata.clone(),
            raffle_account.clone()],
            &[&[b"raffle", &raffle.raffle_no.to_le_bytes(), &[bump]]],
        )?;


        raffle.raffle_state = 4;

        raffle.serialize(&mut &mut raffle_account.data.borrow_mut()[..])?;

        Ok(())
    }

    // katilmak icin ucret topla
    fn collect_fee_initializer(
        accounts: &[AccountInfo],program_id: &Pubkey
    ) -> ProgramResult{

        let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

        let initializer: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let raffle_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
        let term_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

        if !initializer.is_signer {return Err(InitializerNotSigner.into());}

        let  raffle: Raffle = Raffle::try_from_slice(&raffle_account.data.borrow())?;
        let  fee: Term = Term::try_from_slice(&term_account.data.borrow())?;

        if fee.initialized != 2 {return Err(InvalidFee.into());}

        if raffle_account.owner != program_id {return Err(InvalidRaffle.into());}
        if term_account.owner != program_id {return Err(InvalidRaffle.into());}

        if raffle.raffle_state < 2{return Err(InvalidRaffleState.into());}
        if raffle.initializer != initializer.key.to_bytes() {return Err(InvalidInitializer.into());}

        let rent: Rent = Rent::default();
        let rent_amount: u64 = rent.minimum_balance(187);

        msg!("1");
        let total_value: u64 = **raffle_account.try_borrow_lamports()?;
        msg!("2");
        let collected_value: u64 = total_value.checked_sub(rent_amount).ok_or(ArithmeticError)?;
        msg!("3");
        let collected_value_div_by_100: u64 = collected_value.checked_div(100).ok_or(ArithmeticError)?;
        msg!("4");
        let total_fee:u64 = collected_value_div_by_100.checked_mul(fee.fee_percent).ok_or(ArithmeticError)?;
        msg!("5");
        let transfer_to_initializer: u64 = collected_value.checked_sub(total_fee).ok_or(ArithmeticError)?;
        {
            msg!("total_value = {}",total_value);
            msg!("collected_value = {}",collected_value);
            msg!("collected_value_div_by_100 = {}",collected_value_div_by_100);
            msg!("total_fee = {}",total_fee);
        msg!("transfer_to_initializer = {}",transfer_to_initializer);
    }

        **raffle_account.try_borrow_mut_lamports()? -= total_fee;
        **raffle_account.try_borrow_mut_lamports()? -= transfer_to_initializer;

        **term_account.try_borrow_mut_lamports()? += total_fee;
        **initializer.try_borrow_mut_lamports()? += transfer_to_initializer;

        Ok(())
    }

    // cekilis sayisi
    fn init_raffle_counter(
        accounts: &[AccountInfo],program_id: &Pubkey
    ) -> ProgramResult{


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

    // pda
    fn close_participant_pda(
        accounts: &[AccountInfo],program_id: &Pubkey
    ) -> ProgramResult {


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
        if raffle.raffle_no != participant.raffle_no{return Err(InvalidRaffleNo.into());}

        let value = **participant_pda.try_borrow_lamports()?;

        **participant_pda.try_borrow_mut_lamports()? -= value;
        **initializer.try_borrow_mut_lamports()? += value;
        
        Ok(())
    }


    fn init_config(
        accounts: &[AccountInfo], program_id: &Pubkey
    ) -> ProgramResult {
    let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

    let authority_1: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let authority_2: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let authority_3: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let authority_4: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let config_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

    let (config_address, bump) = Pubkey::find_program_address( &[b"config"], program_id);

    let rent: Rent = Rent::default();
    let rent_amount: u64 = rent.minimum_balance(128);

    if config_account.owner != program_id {
        invoke_signed(
            &system_instruction::create_account(
                authority_1.key,
                &config_address,
                rent_amount,
                128,
                program_id,
            ),
            &[authority_1.clone(), config_account.clone()],
            &[&[b"config", &[bump]]],
        )?;
    }


    if !authority_1.is_signer {
        return Err(NotSignerAuth.into());
    }

    let config_data: Config = Config {
        authority_1: authority_1.key.to_bytes(),
        authority_2: authority_2.key.to_bytes(),
        authority_3: authority_3.key.to_bytes(),
        authority_4: authority_4.key.to_bytes(),
    };

    config_data.serialize(&mut &mut config_account.data.borrow_mut()[..])?;

    Ok(())
}


    fn set_config(
        accounts: &[AccountInfo], program_id: &Pubkey
    ) -> ProgramResult {
    let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

    let authority: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let authority_1: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let authority_2: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let authority_3: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let authority_4: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let config_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    

    if config_account.owner != program_id {
        return Err(InvalidConfig.into());
    }
    

    let config: Config = Config::try_from_slice(&config_account.data.borrow())?;


    Self::check_authority(authority.key, config)?;
    

    if !authority.is_signer {
        return Err(NotSignerAuth.into());
    }
    

    let config_data: Config = Config {
        authority_1: authority_1.key.to_bytes(),
        authority_2: authority_2.key.to_bytes(),
        authority_3: authority_3.key.to_bytes(),
        authority_4: authority_4.key.to_bytes(),
    };
    

    config_data.serialize(&mut &mut config_account.data.borrow_mut()[..])?;

    Ok(())
}


    fn init_term_account(
    accounts: &[AccountInfo],
    program_id: &Pubkey,
    data: InitPda,
    ) -> ProgramResult {

    let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

    let authority: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let term_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let config_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

    if config_account.owner != program_id {
        return Err(InvalidConfig.into());
    }

    let config: Config = Config::try_from_slice(&config_account.data.borrow())?;


    Self::check_authority(authority.key, config)?;

    if !authority.is_signer {
        return Err(NotSignerAuth.into());
    }

    let (term_account_pubkey, bump) = Pubkey::find_program_address(&[b"term"], program_id);

    let create_ix: solana_program::instruction::Instruction =
        system_instruction::create_account(
            authority.key,
            &term_account_pubkey,
            data.lamports,
            17,
            program_id,
        );

    invoke_signed(
        &create_ix,
        &[authority.clone(), term_account.clone()],
        &[&[b"term", &[bump]]],
    )?;

    let terms: Term = Term { 
        initialized: 2,
        fee_percent: 0,
        expiration_time: 0,
        min_number_of_participants: 0,  
    };

    terms.serialize(&mut &mut term_account.data.borrow_mut()[..])?;

    Ok(())
}


    fn update_terms(
    accounts: &[AccountInfo],
    program_id: &Pubkey,
    data: Term,
    ) -> ProgramResult {

    let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

    let authority: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let term_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let config_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    

    if config_account.owner != program_id {
        return Err(InvalidConfig.into());
    }


    let config: Config = Config::try_from_slice(&config_account.data.borrow())?;


    Self::check_authority(authority.key, config)?;

    if !authority.is_signer {
        return Err(NotSignerAuth.into());
    }

    let terms: Term = Term{
        initialized:2,
        fee_percent: data.fee_percent,
        expiration_time: data.expiration_time,
        min_number_of_participants: data.min_number_of_participants,
    };

    terms.serialize(&mut &mut term_account.data.borrow_mut()[..])?;

    Ok(())
}


    fn collect_fee(
    accounts: &[AccountInfo],
    program_id: &Pubkey,
    ) -> ProgramResult {

    let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

    let authority: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let fee_collector: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let config_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

    if config_account.owner != program_id {
        return Err(InvalidConfig.into());
    }


    let config: Config = Config::try_from_slice(&config_account.data.borrow())?;

    Self::check_authority(authority.key, config)?;

    if !authority.is_signer {
        return Err(NotSignerAuth.into());
    }

    let value: u64 = **fee_collector.lamports.borrow();

    let collected_fee: u64 = value.checked_sub(2500000).ok_or(ArithmeticError)?;

    **fee_collector.try_borrow_mut_lamports()? -= collected_fee;
    **authority.try_borrow_mut_lamports()? += collected_fee;
    
    Ok(())
   }


    fn check_authority(
        authority: &Pubkey, config: Config
    ) -> ProgramResult {
        let authority_address_1: Pubkey = Pubkey::new_from_array(config.authority_1);
        let authority_address_2: Pubkey = Pubkey::new_from_array(config.authority_2);
        let authority_address_3: Pubkey = Pubkey::new_from_array(config.authority_3);
        let authority_address_4: Pubkey = Pubkey::new_from_array(config.authority_4);
    
        let valid_authorities: [Pubkey; 4] = [
            authority_address_1,
            authority_address_2,
            authority_address_3,
            authority_address_4,
        ];
    
        if !valid_authorities.contains(authority) {
            return Err(InvalidAuth.into());
        }
    
        Ok(())
    }
    
}



//cekilis kayit acik - 1
//cekilis yapildi  - 2
//kazanan yazildi - 3
//kazanan odulu aldi - 4


