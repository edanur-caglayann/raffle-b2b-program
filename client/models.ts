

export  class Raffle{

    raffle_state:number = 0;
    initializer:number[] = Array.from({length: 32}, () => 1);
    token_mint:number[] = Array.from({length: 32}, () => 1);
    winner_address:number[] = Array.from({length: 32}, () => 1);
    raffle_name:number[] = Array.from({length: 32}, () => 1);
    raffle_no:bigint = BigInt(0);
    current_number_of_participants:bigint = BigInt(0);
    participants_required:bigint = BigInt(0);
    winner_no:bigint = BigInt(0);
    participation_fee:bigint = BigInt(0);
    prize_amount:bigint = BigInt(0);
    decimals:number = 0;
    expiration_time:bigint = BigInt(0);

    constructor(fields: {

      raffle_state:number;
      initializer:number[];
      token_mint:number[];
      winner_address:number[];
      raffle_name:number[];
      raffle_no:bigint;
      current_number_of_participants:bigint;
      participants_required:bigint;
      winner_no:bigint;
      participation_fee:bigint;
      prize_amount:bigint;
      decimals:number;
      expiration_time:bigint;
    
  
     } | undefined = undefined)
      {if (fields) {
        this.raffle_state = fields.raffle_state;
        this.initializer = fields.initializer;
        this.token_mint = fields.token_mint;
        this.winner_address = fields.winner_address;
        this.raffle_name = fields.raffle_name;
        this.raffle_no = fields.raffle_no;
        this.current_number_of_participants = fields.current_number_of_participants;
        this.participants_required = fields.participants_required;
        this.winner_no = fields.winner_no;
        this.participation_fee = fields.participation_fee;
        this.prize_amount = fields.prize_amount;
        this.decimals = fields.decimals;
        this.expiration_time = fields.expiration_time;

      }
    }
  }
export  const RaffleSchema =new Map([
    [
      Raffle,
      {
        kind: "struct",
        fields: [
          ["raffle_state","u8"],
          ["initializer",["u8",32]],
          ["token_mint",["u8",32]],
          ["winner_address",["u8",32]],
          ["raffle_name",["u8",32]],
          ["raffle_no","u64"],
          ["current_number_of_participants","u64"],
          ["participants_required","u64"],
          ["winner_no","u64"],
          ["participation_fee","u64"],
          ["prize_amount","u64"],
          ["decimals","u8"],
          ["expiration_time","u64"],
        ],
      },
    ],
  ])

  export  class Counter{

    initialized:number = 0;
    number_of_raffles:bigint = BigInt(0);


    constructor(fields: {

      initialized:number;
      number_of_raffles:bigint;
    
  
     } | undefined = undefined)
      {if (fields) {
        this.initialized = fields.initialized;
        this.number_of_raffles = fields.number_of_raffles;


      }
    }
  }
  export  const CounterSchema =new Map([
    [
      Counter,
      {
        kind: "struct",
        fields: [
          ["initialized","u8"],
          ["number_of_raffles","u64"],

    ],
  },
  ],
  ])

  export  class RaffleName{


    raffle_name:number[] = Array.from({length: 32}, () => 1);

    constructor(fields: {


        raffle_name:number[];
    
  
     } | undefined = undefined)
      {if (fields) {

        this.raffle_name = fields.raffle_name;

      }
    }
  }
export  const RaffleNameSchema =new Map([
    [
      RaffleName,
      {
        kind: "struct",
        fields: [

          ["raffle_name",["u8",32]],
    ],
  },
  ],
  ])

export  class Participation{

    particpant_address:number[] = Array.from({length: 32}, () => 1);
    particpant_no:bigint = BigInt(0);
    raffle_no:bigint = BigInt(0);

    constructor(fields: {

      particpant_address:number[];
      particpant_no:bigint;
      raffle_no:bigint;

  
     } | undefined = undefined)
      {if (fields) {
        this.particpant_address = fields.particpant_address;
        this.particpant_no = fields.particpant_no;
        this.raffle_no = fields.raffle_no;

      }
    }
  }
export  const ParticipationSchema =new Map([
    [
      Participation,
      {
        kind: "struct",
        fields: [
          ["particpant_address",["u8",32]],
          ["particpant_no","u64"],
          ["raffle_no","u64"],
    ],
  },
  ],
  ])

  export   class InitPda{
    bump:number = 0;
    lamports:number = 0
    no:number = 0;
    constructor(fields: {
      bump:number;
      lamports:number;
      no:number;
     } | undefined = undefined)
      {if (fields) {
        this.lamports = fields.lamports;
        this.bump = fields.bump;
        this.no = fields.no;
      }
    }
  }
  export   const InitPdaSchema =new Map([
    [
      InitPda,
      {
        kind: "struct",
        fields: [
          ["bump","u8"],
          ["lamports","u64"],
          ["no","u8"],
    ],
  },
  ],
  ])
  
  export  class Config{
  
    authority1:number[] = Array.from({ length: 32 }, () => 1);
    authority2:number[] = Array.from({ length: 32 }, () => 1);
    authority3:number[] = Array.from({ length: 32 }, () => 1);
    authority4:number[] = Array.from({ length: 32 }, () => 1);
  
    constructor(fields: {
      authority1:number[];
      authority2:number[];
      authority3:number[];
      authority4:number[];
  
     } | undefined = undefined)
      {if (fields) {
        this.authority1 = fields.authority1;
        this.authority2 = fields.authority2;
        this.authority3 = fields.authority3;
        this.authority4 = fields.authority4;
  
      }
    }
  }
  export  const ConfigSchema =new Map([
    [
      Config,
      {
        kind: "struct",
        fields: [
          ["authority1",["u8",32]],
          ["authority2",["u8",32]],
          ["authority3",["u8",32]],
          ["authority4",["u8",32]],
    ],
  },
  ],
  ])
    
  export  class Terms{
  
    init:number = 0;
    fee:bigint = BigInt(0);
    expiration_time:bigint = BigInt(0);
    constructor(fields: {
      init:number;
      fee:bigint;
      expiration_time:bigint;
     } | undefined = undefined)
      {if (fields) {
  
        this.fee = fields.fee;
        this.init = fields.init;
        this.expiration_time = fields.expiration_time;
      }
    }
  }
  export  const TermsSchema =new Map([
    [
        Terms,
      {
        kind: "struct",
        fields: [
          ["init","u8"],
          ["fee","u64"],
          ["expiration_time","u64"],
    ],
  },
  ],
  ])
  

  export  class InitRaffle{

    raffle_name:number[] = Array.from({length: 32}, () => 1);
    participation_fee:bigint = BigInt(0);
    prize_amount:bigint = BigInt(0);
    participants_required:bigint = BigInt(0);
    decimals:number = 0;


    constructor(fields: {
    
      raffle_name:number[];
      participation_fee:bigint;
      prize_amount:bigint;
      participants_required:bigint;
      decimals:number;

  
     } | undefined = undefined)
      {if (fields) {

        this.raffle_name = fields.raffle_name;
        this.participation_fee = fields.participation_fee;
        this.prize_amount = fields.prize_amount;
        this.participants_required = fields.participants_required;
        this.decimals = fields.decimals;

      }
    }
  }
  export  const InitRaffleSchema =new Map([
    [
      InitRaffle,
      {
        kind: "struct",
        fields: [
          ["raffle_name",["u8",32]],
          ["participation_fee","u64"],
          ["prize_amount","u64"],
          ["participants_required","u64"],
          ["decimals","u8"],
        ],
      },
    ],
  ])

