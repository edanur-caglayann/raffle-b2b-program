use borsh::{BorshDeserialize, BorshSerialize};


#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]//187
pub struct Raffle{
    pub raffle_state:u8, // cekilis durumu
    pub is_unlimited_participant_allowed:u8, // sinirsiz katilimciya izin var mi
    pub initializer:[u8;32],
    pub token_mint:[u8;32],
    pub winner_address:[u8;32],
    pub raffle_name:[u8;32],
    pub raffle_no:u64,
    pub current_number_of_participants:u64, // katilimci sayisi
    pub participants_required:u64,
    pub winner_no:u64,
    pub participation_fee:u64, // katilim ucreti
    pub prize_amount:u64,
    pub decimals:u8,
    pub raffle_time:u64,
}//

#[derive(BorshDeserialize, Debug, PartialEq)]
pub struct InitRaffle{ //cekilisi baslasin
  pub is_unlimited_participant_allowed:u8,
  pub raffle_name:[u8;32],
  pub participation_fee:u64,
  pub prize_amount:u64,
  pub participants_required:u64,
  pub decimals:u8,
  pub raffle_time:u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]//48
pub struct Participant{
    pub particpant_address:[u8;32],
    pub particpant_no:u64,
    pub raffle_no:u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]//9
pub struct RaffleCounter{
    pub initialized:u8,
    pub number_of_raffles:u64,
}

#[derive(BorshDeserialize)]
pub struct RandomNumber{
  pub random_number:u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq)]
pub struct Term{
  pub initialized:u8,
  pub fee_percent:u64,
  pub expiration_time:u64, // cekilisin bitis suresi
  pub min_number_of_participants:u64 // min katilimci say
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]//9
pub struct Config{
    pub authority_1:[u8;32],
    pub authority_2:[u8;32],
    pub authority_3:[u8;32],
    pub authority_4:[u8;32],
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub struct InitPda{
    pub bump:u8,
    pub lamports:u64,
    pub no:u8,
}

//Init raffle
//raffle