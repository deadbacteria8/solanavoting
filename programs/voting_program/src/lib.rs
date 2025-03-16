use anchor_lang::prelude::*;

declare_id!("4HxCSZ53BqaxPWtyToZw2zSKshUq4jY3o8yAS2r3D9r4");

#[program]
pub mod voting_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, candidates: Vec<String>) -> Result<()> {
        let voting_account = &mut ctx.accounts.voting_account;
        voting_account.candidates = candidates;
        voting_account.votes = vec![0; voting_account.candidates.len()];
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, candidate_index: u8) -> Result<()> {
        let voting_account = &mut ctx.accounts.voting_account;

        require!(
            (candidate_index as usize) < voting_account.candidates.len(),
            VotingError::InvalidCandidate
        );

        voting_account.votes[candidate_index as usize] += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 200)]
    pub voting_account: Account<'info, VotingAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub voting_account: Account<'info, VotingAccount>,
}

#[account]
pub struct VotingAccount {
    pub candidates: Vec<String>,
    pub votes: Vec<u32>,
}

#[error_code]
pub enum VotingError {
    #[msg("Invalid candidate index.")]
    InvalidCandidate,
}
