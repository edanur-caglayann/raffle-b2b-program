use borsh::{BorshDeserialize, BorshSerialize};


#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]//121
pub struct Raffle{
    pub initializer:[u8;32],
    pub raffle_state:u8,
    pub raffle_no:u64,
    pub number_of_participants:u64,
    pub winner_no:u64,
    pub winner_wallet:[u8;32],
    pub raffle_name:[u8;32]
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

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub struct RaffleName{
    pub name:[u8;32],
}


#[derive(BorshDeserialize)]
pub struct RandomNumber{
  pub random_number:u64,
}