

export  class Raffle{

    initializer:number[] = Array.from({length: 32}, () => 1);
    raffle_state:number = 0;
    raffle_no:bigint = BigInt(0);
    number_of_participants:bigint = BigInt(0);
    winner_no:bigint = BigInt(0);
    winner_wallet:number[] = Array.from({length: 32}, () => 1);
    raffle_name:number[] = Array.from({length: 32}, () => 1);

    constructor(fields: {

        initializer:number[];
        raffle_state:number;
        raffle_no:bigint;
        number_of_participants:bigint;
        winner_no:bigint;
        winner_wallet:number[];
        raffle_name:number[];
    
  
     } | undefined = undefined)
      {if (fields) {
        this.initializer = fields.initializer;
        this.raffle_state = fields.raffle_state;
        this.raffle_no = fields.raffle_no;
        this.number_of_participants = fields.number_of_participants;
        this.winner_no = fields.winner_no;
        this.winner_wallet = fields.winner_wallet;
        this.raffle_name = fields.raffle_name;

      }
    }
  }
  
export  const RaffleSchema =new Map([
    [
      Raffle,
      {
        kind: "struct",
        fields: [
          ["initializer",["u8",32]],
          ["raffle_state","u8"],
          ["raffle_no","u64"],
          ["number_of_participants","u64"],
          ["winner_no","u64"],
          ["winner_wallet",["u8",32]],
          ["raffle_name",["u8",32]],
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


  export  class NumberOfParticipants{

    batch:bigint = BigInt(0);

    constructor(fields: {

      batch:bigint;

  
     } | undefined = undefined)
      {if (fields) {
        this.batch = fields.batch;

      }
    }
  }
  
export  const NumberOfParticipantsSchema =new Map([
    [
      NumberOfParticipants,
      {
        kind: "struct",
        fields: [
          ["batch","u64"],
    ],
  },
  ],
  ])