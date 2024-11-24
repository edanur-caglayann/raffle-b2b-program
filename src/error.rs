use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum RaffleProgramError {
  /// Invalid Instruction
  #[error("Invalid Instruction")]//0
  InvalidInstruction,

  #[error("arithmetic error")]//1
  ArithmeticError,

  #[error("counter account is invalid")]//2
  InvalidCounter,
  
  #[error("current raffle initializer is invalid")]//3
  InvalidInitializer,

  #[error("raffle account is invalid")]//4
  InvalidRaffle,

  #[error("initializer account is not signer")]//5
  InitializerNotSigner,

  #[error("derived pda address and winner pda does not match")]//6
  InvalidWinnerPDA,

  #[error("participant no and raffle winner no does not match")]//7
  InvaliedWinnerNo,
  
  #[error("participant raffle no and raffle no does not match")]//8
  InvaliedRaffleNo,

  #[error("participant pda doesnt belong to program")]//9
  InvalidParticipantPDA,


  #[error("raffle state is invalid")]//10
  InvalidRaffleState

}

impl From<RaffleProgramError> for ProgramError {
  fn from(e: RaffleProgramError) -> Self {
    ProgramError::Custom(e as u32)
  }
}
