use crate::{error::RaffleProgramError::InvalidInstruction, state::{Batch, Raffle}};
use borsh::BorshDeserialize;
use solana_program::program_error::ProgramError;

#[derive(Debug, PartialEq)]
pub enum RaffleProgramInstruction {
    InitRaffle{init_raffle:Raffle},
    AddWallets{number_of_participants:Batch},
    ChooseWinner,
    PublishWinner,
    InitCounter,
    ClosePDA
}

impl RaffleProgramInstruction {
  pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {

    let (tag, rest) = input.split_first().ok_or(InvalidInstruction)?;
    Ok(match tag {
      0 => Self::InitRaffle{
        init_raffle:Raffle::try_from_slice(&rest)?
      },
      1 => Self::AddWallets{
        number_of_participants:Batch::try_from_slice(&rest)?
      },
      2 => Self::ChooseWinner,
      3 => Self::PublishWinner,
      4 => Self::InitCounter,
      5 => Self::ClosePDA,
      
      

      _ => return Err(InvalidInstruction.into()),
    })
  }
}
