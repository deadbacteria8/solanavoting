use anchor_lang::prelude::*;

declare_id!("Hungg8bvpJJTEmCxn8Q3KFGheiHuzd3jTXiX5hRmYxWC");

#[program]
pub mod voting_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
